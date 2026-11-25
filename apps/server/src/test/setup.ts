import debug from 'debug';
import '@teams2/logger';

// @teams2/logger pri importe zapína info/warning/error logy – v testoch ich vypneme,
// zapnúť sa dajú cez `DEBUG_TESTS=1 pnpm test:integration`
if (!process.env.DEBUG_TESTS) {
  debug.disable();
}

// Spoločný setup integračných testov – externé služby sa mockujú.

// AWS SES – e-maily sa neodosielajú, testy môžu kontrolovať volania `sendEmail`
vi.mock('../app/utils/mailer', () => ({
  sendEmail: vi.fn(async () => undefined),
}));

// AWS S3 – žiadne volania do AWS
vi.mock('../app/utils/aws-s3', () => ({
  getLogoFileName: vi.fn(() => 'logo.png'),
  deleteFileFromBucket: vi.fn(async () => true),
  getSignedUrlForUpload: vi.fn(async (fileName: string) => `https://s3.test/upload/${fileName}`),
  getSignedUrlForDownload: vi.fn(async (fileName: string) => `https://s3.test/${fileName}`),
}));
