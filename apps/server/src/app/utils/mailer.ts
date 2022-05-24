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
  logLib.debug('Sending email to=%o subject=%s', to, subject);
  to.forEach((t) => sendEmail([t], subject, text));
}

export function sendHtmlEmailSeparately(to: string[], subject: string, html: string) {
  logLib.debug('Sending email to=%o subject=%s', to, subject);
  to.forEach((t) => sendHtmlEmail([t], subject, html));
}

function sendEmail_prim(mailOptions: nodemailer.SendMailOptions) {
  const log = logLib.extend('sendEmail');
  log.debug('Sending email to=%o subject=%s text=%s', mailOptions.to, mailOptions.subject);
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

export function sendHtmlEmail(to: string[], subject: string, html: string) {
  const mailOptions = {
    from: getServerConfig().smtp.from,
    to: to.join(','),
    subject,
    html,
  };
  sendEmail_prim(mailOptions);
}

export function sendEmail(to: string[], subject: string, text: string) {
  const mailOptions = {
    from: getServerConfig().smtp.from,
    to: to.join(','),
    subject,
    text,
  };
  sendEmail_prim(mailOptions);
}
