import { ObjectId } from 'mongodb';
import {
  checkEventRegistration,
  checkProgramRegistration,
  MAX_FOOD_ITEM_QUANTITY,
  priceFoodOrderItems,
} from './registration-rules';

const NOW = new Date('2026-11-26T10:00:00+01:00');
const day = (iso: string) => new Date(`${iso}T00:00:00+01:00`); // polnoc v Bratislave
const coach = { isAdmin: false, now: NOW };
const admin = { isAdmin: true, now: NOW };

describe('checkEventRegistration (#283)', () => {
  const teamId = new ObjectId();
  const event = {
    registrationEnd: day('2026-11-30'),
    date: day('2026-12-05'),
    invitationOnly: false,
    invitedTeamsIds: [] as ObjectId[],
    maxTeams: 10,
  };

  it('otvorený turnaj s voľnou kapacitou', () => {
    expect(checkEventRegistration(event, teamId, 9, coach)).toBeNull();
  });

  it('neexistujúci, zmazaný alebo archivovaný turnaj neprejde ani adminovi', () => {
    expect(checkEventRegistration(null, teamId, 0, admin)).toBe('event_not_found');
    expect(checkEventRegistration({ ...event, deletedOn: NOW }, teamId, 0, admin)).toBe(
      'event_not_available',
    );
    expect(checkEventRegistration({ ...event, archivedOn: NOW }, teamId, 0, admin)).toBe(
      'event_not_available',
    );
  });

  it('termín registrácie – posledný deň je ešte otvorený, nasledujúci už nie', () => {
    expect(
      checkEventRegistration({ ...event, registrationEnd: day('2026-11-26') }, teamId, 0, coach),
    ).toBeNull();
    expect(
      checkEventRegistration({ ...event, registrationEnd: day('2026-11-25') }, teamId, 0, coach),
    ).toBe('registration_closed');
  });

  it('turnaj, ktorý už prebehol', () => {
    expect(
      checkEventRegistration(
        { ...event, registrationEnd: undefined, date: day('2026-11-20') },
        teamId,
        0,
        coach,
      ),
    ).toBe('event_past');
  });

  it('turnaj na pozvánky – iba pozvaný tím', () => {
    const inv = { ...event, invitationOnly: true, invitedTeamsIds: [new ObjectId()] };
    expect(checkEventRegistration(inv, teamId, 0, coach)).toBe('not_invited');
    expect(
      checkEventRegistration({ ...inv, invitedTeamsIds: [teamId] }, teamId, 0, coach),
    ).toBeNull();
  });

  it('naplnený turnaj', () => {
    expect(checkEventRegistration(event, teamId, 10, coach)).toBe('event_full');
  });

  it('admin môže registrovať mimo termínu, bez pozvánky a nad kapacitu', () => {
    const closed = {
      ...event,
      registrationEnd: day('2026-11-01'),
      invitationOnly: true,
      maxTeams: 1,
    };
    expect(checkEventRegistration(closed, teamId, 5, admin)).toBeNull();
  });
});

describe('checkProgramRegistration (#283)', () => {
  const program = {
    startDate: day('2026-09-01'),
    endDate: day('2027-06-30'),
    maxTeams: 2,
    regTypesAllowed: ['NORMAL' as const],
  };

  it('aktívny program a povolený typ', () => {
    expect(checkProgramRegistration(program, 'NORMAL', 1, coach)).toBeNull();
    expect(checkProgramRegistration(program, undefined, 1, coach)).toBeNull();
  });

  it('neexistujúci alebo zmazaný program', () => {
    expect(checkProgramRegistration(null, 'NORMAL', 0, admin)).toBe('program_not_found');
    expect(checkProgramRegistration({ ...program, deletedOn: NOW }, 'NORMAL', 0, admin)).toBe(
      'program_not_found',
    );
  });

  it('program, ktorý ešte nezačal alebo už skončil', () => {
    expect(
      checkProgramRegistration({ ...program, startDate: day('2026-12-01') }, 'NORMAL', 0, coach),
    ).toBe('program_not_active');
    expect(
      checkProgramRegistration({ ...program, endDate: day('2026-11-01') }, 'NORMAL', 0, coach),
    ).toBe('program_not_active');
  });

  it('nepovolený typ registrácie a naplnený program', () => {
    expect(checkProgramRegistration(program, 'CLASS_PACK', 0, coach)).toBe(
      'registration_type_not_allowed',
    );
    expect(checkProgramRegistration(program, 'NORMAL', 2, coach)).toBe('program_full');
  });

  it('admin má výnimku z pravidiel', () => {
    expect(
      checkProgramRegistration({ ...program, endDate: day('2026-11-01') }, 'CLASS_PACK', 9, admin),
    ).toBeNull();
  });
});

describe('priceFoodOrderItems (#283)', () => {
  const f1 = { _id: new ObjectId(), n: 'Obed', up: 4.5 };
  const f2 = { _id: new ObjectId(), n: 'Večera', up: 3.333 };

  it('cena a názov sú z cenníka turnaja, nie od klienta', () => {
    const items = priceFoodOrderItems(
      [{ productId: f1._id, quantity: 3, unitPrice: 0, price: 0, name: 'Zadarmo' } as never],
      [f1, f2],
    );
    expect(items).toEqual([
      { productId: f1._id, name: 'Obed', quantity: 3, unitPrice: 4.5, price: 13.5 },
    ]);
  });

  it('položky s množstvom 0 vynechá, cenu zaokrúhli na centy, akceptuje ID ako reťazec', () => {
    const items = priceFoodOrderItems(
      [
        { productId: f1._id, quantity: 0 },
        { productId: f2._id.toString() as never, quantity: 3 },
      ],
      [f1, f2],
    );
    expect(items).toHaveLength(1);
    expect(items[0].price).toBe(10);
  });

  it('neznámu položku alebo neplatné množstvo odmietne', () => {
    expect(() => priceFoodOrderItems([{ productId: new ObjectId(), quantity: 1 }], [f1])).toThrow(
      /neznámu/,
    );
    for (const quantity of [-1, 1.5, Number.NaN, MAX_FOOD_ITEM_QUANTITY + 1]) {
      expect(() => priceFoodOrderItems([{ productId: f1._id, quantity }], [f1])).toThrow(
        /množstvo/,
      );
    }
  });
});
