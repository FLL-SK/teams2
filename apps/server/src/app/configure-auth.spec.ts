import { isTokenIssuedBeforePasswordChange } from './configure-auth';

describe('isTokenIssuedBeforePasswordChange (#281)', () => {
  const changed = new Date('2026-11-25T10:00:00.500Z');
  const sec = Math.floor(changed.getTime() / 1000);

  it('token vydaný pred zmenou hesla je neplatný', () => {
    expect(isTokenIssuedBeforePasswordChange({ passwordChangedOn: changed }, { issuedAt: sec - 1 })).toBe(
      true,
    );
  });

  it('token vydaný v tú istú sekundu alebo neskôr platí', () => {
    expect(isTokenIssuedBeforePasswordChange({ passwordChangedOn: changed }, { issuedAt: sec })).toBe(false);
    expect(isTokenIssuedBeforePasswordChange({ passwordChangedOn: changed }, { issuedAt: sec + 5 })).toBe(
      false,
    );
  });

  it('bez zmeny hesla alebo bez údajov o tokene sa nič neobmedzuje', () => {
    expect(isTokenIssuedBeforePasswordChange({}, { issuedAt: 1 })).toBe(false);
    expect(isTokenIssuedBeforePasswordChange({ passwordChangedOn: changed })).toBe(false);
  });
});
