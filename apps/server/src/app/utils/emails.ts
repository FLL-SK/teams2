import { msgFromTemplate, msgPasswordReset } from '../templates';
import { sendHtmlEmail } from './mailer';

export function sendMessage(to: string[], title: string, message: string) {
  const html = msgFromTemplate(title, message);
  sendHtmlEmail(to, title, html);
}

export function sendPasswordResetEmail(email: string, token: string) {
  // send email
  sendHtmlEmail([email], 'Ziadost o reset hesla', msgPasswordReset(email, token));
}
