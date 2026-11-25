import { getServerConfig, maskConfig, maskUriCredentials } from './server-config';

describe('maskConfig (#282)', () => {
  const env = { ...process.env };
  afterEach(() => {
    process.env = { ...env };
  });

  it('zamaskuje tajomstvá v konfigurácii servera', () => {
    Object.assign(process.env, {
      APP_JWT_SECRET: 'jwt-tajomstvo',
      AWS_ACCESS_KEY_ID: 'AKIAXXXX',
      AWS_SECRET_ACCESS_KEY: 'aws-tajomstvo',
      SF_AUTH_API_KEY: 'sf-tajomstvo',
      SF_PAYMENT_KEY: 'platba-tajomstvo',
      APP_MONGODB: 'mongodb://tms:db-heslo@db.example.com/teams2',
      SF_AUTH_EMAIL: 'fakturacia@example.com',
    });
    const masked = maskConfig(getServerConfig());
    const text = JSON.stringify(masked);

    for (const secret of [
      'jwt-tajomstvo',
      'AKIAXXXX',
      'aws-tajomstvo',
      'sf-tajomstvo',
      'platba-tajomstvo',
      'db-heslo',
    ]) {
      expect(text).not.toContain(secret);
    }
    expect(masked.jwt.secret).toBe('***');
    expect(masked.invoicing.sf.payment_secret_key).toBe('***');
    expect(masked.mongoDBUri).toBe('mongodb://tms:***@db.example.com/teams2');
    // netajné hodnoty zostanú čitateľné
    expect(masked.invoicing.sf.email).toBe('fakturacia@example.com');
    expect(masked.port).toBe(getServerConfig().port);
  });

  it('nezmení pôvodný objekt a nechá prázdne tajomstvo prázdne', () => {
    const cfg = { jwt: { secret: '' }, aws: { secretAccessKey: undefined as string | undefined } };
    const masked = maskConfig(cfg);
    expect(masked.jwt.secret).toBe('');
    expect(masked.aws.secretAccessKey).toBeUndefined();
    expect(masked).not.toBe(cfg);
  });

  it('maskUriCredentials nechá URI bez hesla bez zmeny', () => {
    expect(maskUriCredentials('mongodb://localhost/teams2')).toBe('mongodb://localhost/teams2');
    expect(maskUriCredentials('https://example.com/a?b=c')).toBe('https://example.com/a?b=c');
  });
});
