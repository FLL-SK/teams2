import { ObjectId } from 'mongodb';
import { RegistrationData } from '../../models';
import { RegistrationMapper } from './registration.mapper';

const address = {
  _id: new ObjectId(),
  name: 'Testovací tím',
  street: 'Ulica 1',
  city: 'Bratislava',
  zip: '81101',
};

const baseRegistration = (): RegistrationData => ({
  _id: new ObjectId(),
  programId: new ObjectId(),
  teamId: new ObjectId(),
  billTo: { ...address },
  shipTo: { ...address, _id: new ObjectId() },
  createdOn: new Date('2026-09-01T00:00:00.000Z'),
  createdBy: new ObjectId(),
  type: 'NORMAL',
  teamsImpacted: 1,
  setCount: 1,
});

describe('RegistrationMapper.toRegistration', () => {
  it('returns null for missing registration', () => {
    expect(RegistrationMapper.toRegistration(null)).toBeNull();
    expect(RegistrationMapper.toRegistration(undefined)).toBeNull();
  });

  it('maps basic fields and addresses', () => {
    const reg = baseRegistration();
    const result = RegistrationMapper.toRegistration(reg);

    expect(result).toMatchObject({
      id: reg._id,
      programId: reg.programId,
      teamId: reg.teamId,
      createdOn: reg.createdOn,
      createdBy: reg.createdBy,
      type: 'NORMAL',
    });
    expect(result?.billTo).toMatchObject({ id: reg.billTo._id, name: 'Testovací tím' });
    expect(result?.shipTo?.id).toEqual(reg.shipTo._id);
  });

  it('fills defaults for missing optional values', () => {
    const result = RegistrationMapper.toRegistration(baseRegistration());

    expect(result).toMatchObject({
      teamNo: 'xxx',
      girlCount: 0,
      boyCount: 0,
      coachCount: 0,
      impactedChildrenCount: 0,
      foodOrder: null,
      invoiceItems: [],
      team: null,
      event: null,
      program: null,
      files: [],
    });
  });

  it('maps impacted counts and food order', () => {
    const orderId = new ObjectId();
    const itemId = new ObjectId();
    const reg: RegistrationData = {
      ...baseRegistration(),
      type: 'CLASS_PACK',
      teamNo: 'T-042',
      girlCount: 2,
      boyCount: 3,
      coachCount: 1,
      childrenImpacted: 120,
      teamsImpacted: 6,
      setCount: 3,
      foodOrder: {
        _id: orderId,
        createdOn: new Date('2026-10-01T00:00:00.000Z'),
        items: [
          {
            _id: itemId,
            productId: new ObjectId(),
            name: 'Obed',
            quantity: 5,
            unitPrice: 4,
            price: 20,
          },
        ],
        billTo: { ...address },
      },
    } as RegistrationData;

    const result = RegistrationMapper.toRegistration(reg);

    expect(result).toMatchObject({
      type: 'CLASS_PACK',
      teamNo: 'T-042',
      girlCount: 2,
      boyCount: 3,
      coachCount: 1,
      impactedChildrenCount: 120,
      impactedTeamCount: 6,
      setCount: 3,
    });
    expect(result?.foodOrder?.id).toEqual(orderId);
    expect(result?.foodOrder?.items).toEqual([
      expect.objectContaining({ id: itemId, name: 'Obed', quantity: 5, price: 20 }),
    ]);
  });
});
