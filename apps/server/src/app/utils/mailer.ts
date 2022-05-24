import * as nodemailer from 'nodemailer';
import { getServerConfig } from '../../server-config';

import { logger } from '@teams2/logger';

const logLib = logger('mailer');

const mailer = createMailer();

function createMailer() {
  const cfg = getServerConfig();
  const options = {
    host: cfg.smtp.host,
    port: cfg.smtp.port,
    secure: cfg.smtp.tls,
    auth: {
      user: cfg.smtp.username,
      pass: cfg.smtp.password,
    },
  };
  logLib.debug('Creating mailer using config=%o', options);
  const transporter = nodemailer.createTransport(options);
  return transporter;
}

export function sendEmailSeparately(to: string[], subject: string, text: string) {
  logLib.debug('Sending email to=%o subject=%s text=%s', to, subject, text);
  to.forEach((t) => sendEMail([t], subject, text));
}

export function sendEMail(to: string[], subject: string, text: string) {
  const cfg = getServerConfig();
  const mailOptions = {
    from: cfg.smtp.from,
    to: to.join(','),
    subject,
    text,
  };
  logLib.debug('Sending email options=%o', mailOptions);
  mailer.sendMail(mailOptions, (err, info) => {
    if (err) {
      return logLib.warn('Error sending options=%o err=%o', mailOptions, err);
    }
    logLib.info(
      'Message to:%o subject:%s id:%s',
      mailOptions.to,
      mailOptions.subject,
      info.messageId
    );
  });
}
