import { SendEmailCommand, SendEmailCommandInput, SESClient } from '@aws-sdk/client-ses';
import { getServerConfig } from '../../server-config';
import { debugLib } from './debug';
import { getAppSettings } from './settings';

const debug = debugLib.extend('mailer');

const sesClient = createSESClient();

function createSESClient() {
  const cfg = getServerConfig();
  return new SESClient({
    region: cfg.aws.region,
    credentials: { accessKeyId: cfg.aws.accessKeyId, secretAccessKey: cfg.aws.secretAccessKey },
  });
}

interface SendEmailOptions {
  from?: string;
  to?: string | string[];
  bcc?: string | string[];
  cc?: string | string[];
  subject: string;
  text?: string;
  html?: string;
  replyTo?: string;
}

const createSendEmailCommand = (options: SendEmailOptions) => {
  const { to, bcc, cc, subject, text, html, from, replyTo } = options;

  if (!to) throw new Error('Missing "to" address.');
  if (!subject) throw new Error('Missing "subject".');
  if (!html && !text) throw new Error('Missing "html" or "text" body.');

  const params: SendEmailCommandInput = {
    Destination: {
      ToAddresses: typeof to === 'string' ? [to] : to,
      BccAddresses: typeof bcc === 'string' ? [bcc] : bcc,
      CcAddresses: typeof cc === 'string' ? [cc] : cc,
    },
    Message: {
      Body: {},
      Subject: {
        Charset: 'UTF-8',
        Data: subject,
      },
    },
    Source: from,
    ReplyToAddresses: typeof replyTo === 'string' ? [replyTo] : replyTo,
  };

  if (html) {
    params.Message.Body.Html = {
      Charset: 'UTF-8',
      Data: html,
    };
  } else if (text)
    params.Message.Body.Text = {
      Charset: 'UTF-8',
      Data: text,
    };

  debug('Created SendEmailCommand. %o', params);

  return new SendEmailCommand(params);
};

export async function sendEmail(options: SendEmailOptions) {
  const settings = await getAppSettings();
  const from = settings.emailFrom;
  const sendEmailCommand = createSendEmailCommand({ from, ...options });
  debug('Sending email. from=%o options=%o', from, options);
  return await sesClient.send(sendEmailCommand);
}
