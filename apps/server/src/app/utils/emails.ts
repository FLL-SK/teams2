import { getServerConfig } from '../../server-config';
import { msgFromTemplate, msgPasswordReset } from '../templates';
import { sendHtmlEmail } from './mailer';

export function emailMessage(to: string, subject: string, title: string, message: string) {
  const html = msgFromTemplate(title, message);
  sendHtmlEmail(to, subject, html);
}

export function emailPasswordReset(email: string, token: string) {
  // send email
  sendHtmlEmail(email, 'Obnovenie hesla', msgPasswordReset(email, token));
}

export function emailUserSignupToUser(userEmail: string) {
  const subject = 'Účet bol vytvorený';
  const title = subject;
  const msg = `Účet pre email ${userEmail} bol vytvorený.`;
  emailMessage(userEmail, subject, title, msg);
}

export function emailUserSignupToAdmin(userEmail: string) {
  const subject = 'Nový účet';
  const title = subject;
  const msg = `Účet pre email ${userEmail} bol vytvorený.`;
  emailMessage(getServerConfig().adminEmail, subject, title, msg);
}

export function emailTeamRegisteredToCoach(
  emails: string[],
  teamName: string,
  eventName: string,
  programName: string,
  eventUrl: string
) {
  const subject = 'Registrácia vášho tímu';
  const title = subject;
  const msg = `Váš tím ${teamName} bol úspešne zaregistrovaný na turnaj ${eventName} programu ${programName}. Viac informácií o turnaji nájdete tu ${eventUrl}`;
  emails.forEach((m) => emailMessage(m, subject, title, msg));
}

export function emailTeamRegisteredToEventManagers(
  emails: string[],
  teamName: string,
  eventName: string,
  programName: string,
  eventUrl: string
) {
  const subject = 'Registrácia tímu';
  const title = subject;
  const msg = `Tím ${teamName} bol úspešne zaregistrovaný na turnaj ${eventName} programu ${programName}. Viac informácií o turnaji nájdete tu ${eventUrl}`;
  emails.forEach((m) => emailMessage(m, subject, title, msg));
}

export function emailTeamUnRegisteredToCoach(
  emails: string[],
  teamName: string,
  eventName: string,
  programName: string,
  eventUrl: string
) {
  const subject = 'Zrušenie registrácie vášho tímu';
  const title = subject;
  const msg = `Registrácia vášho tímu ${teamName} na turnaj ${eventName} programu ${programName} bola zrušená. Viac informácií o turnaji nájdete tu ${eventUrl}`;
  emails.forEach((m) => emailMessage(m, subject, title, msg));
}

export function emailTeamUnRegisteredToEventManagers(
  emails: string[],
  teamName: string,
  eventName: string,
  programName: string,
  eventUrl: string
) {
  const subject = 'Zrušenie registrácia tímu';
  const title = subject;
  const msg = `Registrácia tímu ${teamName} turnaj ${eventName} programu ${programName} bola zrušená. Viac informácií o turnaji nájdete tu ${eventUrl}`;
  emails.forEach((m) => emailMessage(m, subject, title, msg));
}

//TODO
// notify team unregistered - coach, eventmgrs
// notify new program manager -> admin
// notify new event manager -> program mgr, admin
// notify event modified -> coaches, event mgr, program mgr
