import { ObjectId } from 'mongodb';
import { queryResolvers } from './product.resolvers';

vi.mock('../mappers', () => ({
  ProgramMapper: { toProduct: (p: { id: ObjectId }) => ({ type: 'program', id: p.id.toString() }) },
  EventMapper: { toProduct: (e: { id: ObjectId }) => ({ type: 'event', id: e.id.toString() }) },
}));

describe('getProducts (#302)', () => {
  it('vynechá programy a turnaje, na ktoré je tím už registrovaný (ObjectId podľa hodnoty)', async () => {
    const [p1, p2, e1, e2] = [new ObjectId(), new ObjectId(), new ObjectId(), new ObjectId()];
    const dataSources = {
      program: { getPrograms: vi.fn().mockResolvedValue([{ id: p1 }, { id: p2 }]) },
      event: { getEvents: vi.fn().mockResolvedValue([{ id: e1 }, { id: e2 }]) },
      registration: {
        // iné inštancie ObjectId s rovnakou hodnotou – predtým `===` / `==` porovnávali referencie
        getRegistrations: vi.fn().mockResolvedValue([
          { programId: new ObjectId(p1.toString()), eventId: null },
          { programId: new ObjectId(p2.toString()), eventId: new ObjectId(e1.toString()) },
        ]),
      },
    };
    const getProducts = queryResolvers.getProducts as unknown as (
      parent: unknown,
      args: { teamId: ObjectId },
      ctx: unknown,
    ) => Promise<{ type: string; id: string }[]>;

    const products = await getProducts({}, { teamId: new ObjectId() }, { dataSources });
    expect(products).toEqual([{ type: 'event', id: e2.toString() }]);
  });
});
