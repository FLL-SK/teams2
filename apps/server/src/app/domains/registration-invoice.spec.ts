import { ObjectId } from 'mongodb';
import { ApolloContext } from '../apollo/apollo-context';
import { UserGuard } from '../utils/user-guard';
import { createRegistrationInvoice, emailRegistrationInvoice } from './registration';

const { postInvoice, emailInvoice, findById } = vi.hoisted(() => ({
  postInvoice: vi.fn(),
  emailInvoice: vi.fn(),
  findById: vi.fn(),
}));

vi.mock('../utils/mailer', () => ({ sendEmail: vi.fn(async () => undefined) }));
vi.mock('./invoicingAPI-superfaktura', () => ({
  InvoicingAPISuperfaktura: class {
    constructInvoice = vi.fn(() => ({}));
    postInvoice = postInvoice;
    emailInvoice = emailInvoice;
  },
}));
vi.mock('../models', async (importOriginal) => {
  const original = await importOriginal<typeof import('../models')>();
  return { ...original, registrationRepository: { findById } };
});

const coachCtx = () =>
  ({
    user: { _id: new ObjectId() },
    userGuard: new UserGuard({ _id: new ObjectId(), username: 'coach@example.com' } as never),
  }) as unknown as ApolloContext;

// Regresia #280: faktúra sa odoslala do SuperFaktúry skôr, než sa overilo oprávnenie
describe('fakturácia registrácie – oprávnenia (#280)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('createRegistrationInvoice odmietne neadmina bez volania SuperFaktúry a DB', async () => {
    await expect(createRegistrationInvoice(new ObjectId(), coachCtx())).rejects.toThrow(
      /Not authorized/,
    );
    expect(postInvoice).not.toHaveBeenCalled();
    expect(findById).not.toHaveBeenCalled();
  });

  it('emailRegistrationInvoice odmietne neadmina bez odoslania e-mailu', async () => {
    await expect(emailRegistrationInvoice(new ObjectId(), coachCtx())).rejects.toThrow(
      /Not authorized/,
    );
    expect(emailInvoice).not.toHaveBeenCalled();
    expect(findById).not.toHaveBeenCalled();
  });
});
