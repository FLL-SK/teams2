export function getServerConfig() {
  const clientRootUrls = (process.env.APP_CLIENT_ROOT_URL ?? 'http://localhost:4200')
    .split(',')
    .map((u) => u.trim());

  // NODE_ENV has to be adressed in this way to be able to use it in the nx workspacem see:
  // https://stackoverflow.com/questions/58090082/process-env-node-env-always-development-when-building-nestjs-app-with-nrwl-nx
  const nodeEnv = process.env['NODE_ENV'] ?? 'development';

  return {
    nodeEnv,
    host: process.env.APP_HOST ?? 'localhost',
    port: process.env.PORT ? Number(process.env.PORT) : 5000,
    // počet dôveryhodných reverzných proxy pred serverom (Express `trust proxy`) – v produkcii
    // je server za nginx proxy; bez toho by mali všetci klienti IP proxy (rate limiting, logy)
    trustProxy: parseTrustProxy(process.env.APP_TRUST_PROXY),

    mongoDBUri: process.env.APP_MONGODB ?? 'mongodb://localhost/teams2',

    graphQLSchemaPath:
      process.env.APP_GRAPHQL_SCHEMA ??
      (nodeEnv === 'development' ? './dist/schema.graphql' : './schema.graphql'),
    email: {
      from: process.env.APP_EMAIL_FROM,
    },
    jwt: {
      secret: process.env.APP_JWT_SECRET,
    },

    clientAppRootUrl: clientRootUrls[0], // the first one is the primary
    clientAppRootUrlsForCORS: clientRootUrls,
    aws: {
      region: process.env.AWS_REGION,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      s3bucket: process.env.AWS_BUCKET,
    },
    invoicing: {
      type: 'superfaktura',
      sf: {
        apiUrl: process.env.SF_API_URL,
        email: process.env.SF_AUTH_EMAIL,
        apiKey: process.env.SF_AUTH_API_KEY,
        companyId: process.env.SF_AUTH_COMPANY_ID,
        module: process.env.SF_AUTH_MODULE,
        payment_secret_key: process.env.SF_PAYMENT_KEY,
      },
    },
    app: {
      superadminUsername: process.env.SUPERADMIN_USERNAME,
    },
  };
}

/** `APP_TRUST_PROXY`: číslo (počet proxy), `true`/`false`; predvolene 1 */
export function parseTrustProxy(value: string | undefined): number | boolean {
  if (value === undefined || value.trim() === '') {
    return 1;
  }
  const v = value.trim().toLowerCase();
  if (v === 'true') return true;
  if (v === 'false') return false;
  const n = Number(v);
  return Number.isInteger(n) && n >= 0 ? n : 1;
}

export type ServerConfig = ReturnType<typeof getServerConfig>;

/** kľúče konfigurácie, ktorých hodnota je tajomstvo (porovnáva sa bez ohľadu na veľkosť písmen) */
const SECRET_KEY_PATTERN = /secret|apikey|api_key|password|accesskeyid/i;

/** zamaskuje prihlasovacie údaje v URI, napr. mongodb://user:heslo@host → mongodb://user:***@host */
export function maskUriCredentials(uri: string): string {
  return uri.replace(/^([a-z][a-z0-9+.-]*:\/\/[^:/@]+):[^@/]*@/i, '$1:***@');
}

/**
 * Vráti kópiu konfigurácie vhodnú na logovanie – tajomstvá (JWT secret, AWS a SuperFaktúra kľúče,
 * platobný kľúč) sú nahradené `***`, z URI sú odstránené heslá. #282
 */
export function maskConfig<T>(value: T, key = ''): T {
  if (value === null || value === undefined) {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((v) => maskConfig(v, key)) as T;
  }
  if (typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, maskConfig(v, k)]),
    ) as T;
  }
  if (typeof value === 'string') {
    if (SECRET_KEY_PATTERN.test(key) || /payment.?key/i.test(key)) {
      return (value ? '***' : value) as T;
    }
    return maskUriCredentials(value) as T;
  }
  return value;
}
