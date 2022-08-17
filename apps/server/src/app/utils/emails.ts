import { appPath } from '@teams2/common';
import { ObjectId } from 'mongodb';
import { getServerConfig } from '../../server-config';
import { eventRepository, teamRepository, userRepository } from '../models';
import { msgFromTemplate, msgPasswordReset } from '../templates';
import { sendHtmlEmail } from './mailer';
import { getAppSettings } from './settings';

export function emailMessage(to: string, subject: string, title: string, message: string) {
  msgFromTemplate(title, message).then((html) => sendHtmlEmail(to, subject, html));
}

export function emailPasswordReset(email: string, token: string) {
  // send email
  msgPasswordReset(email, token).then((html) => sendHtmlEmail(email, 'Password reset', html));
}

export function emailUserSignupToUser(userEmail: string) {
  const subject = 'Účet bol vytvorený';
  const title = subject;
  const msg = `Účet pre email ${userEmail} bol vytvorený.`;
  emailMessage(userEmail, subject, title, msg);
}

export function emailUserSignupToAdmin(userEmail: string) {
  const subject = `Nový účet ${userEmail}`;
  const title = subject;
  const msg = `Účet pre email ${userEmail} bol vytvorený.`;
  getAppSettings().then((s) => emailMessage(s.sysEmail, subject, title, msg));
}

export function emailTeamRegisteredToCoach(
  emails: string[],
  teamName: string,
  eventName: string,
  programName: string,
  eventUrl: string
) {
  const subject = `Registrácia vášho tímu ${teamName}`;
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
  const subject = `Registrácia tímu ${teamName}`;
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
  const subject = `Zrušenie registrácie vášho tímu ${teamName}`;
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
  const subject = `Zrušenie registrácia tímu ${teamName}`;
  const title = subject;
  const msg = `Registrácia tímu ${teamName} turnaj ${eventName} programu ${programName} bola zrušená. Viac informácií o turnaji nájdete tu ${eventUrl}`;
  emails.forEach((m) => emailMessage(m, subject, title, msg));
}

export function emailEventChangedToCoach(
  emails: string[],
  teamName: string,
  eventName: string,
  programName: string,
  eventUrl: string
) {
  const subject = `Zmena na turnaji ${eventName}`;
  const title = subject;
  const msg = `Turnaj ${eventName} programu ${programName}, na ktorý je váš tím ${teamName} regitrovaný, bol zmenený. Viac informácií o turnaji nájdete tu ${eventUrl}`;
  emails.forEach((m) => emailMessage(m, subject, title, msg));
}

export function emailEventChangedToEventManagers(
  emails: string[],
  eventName: string,
  programName: string,
  eventUrl: string
) {
  const subject = `Zmena turnaja ${eventName}`;
  const title = subject;
  const msg = `Turnaj turnaj ${eventName} programu ${programName} bol zmenený. Viac informácií o turnaji nájdete tu ${eventUrl}`;
  emails.forEach((m) => emailMessage(m, subject, title, msg));
}

export function emailUserAcceptedGdprToAdmin(userEmail: string) {
  const subject = `Akceptované GDPR ${userEmail}`;
  const title = subject;
  const msg = `Používateľ ${userEmail} akceptoval GDPR.`;
  getAppSettings().then((s) => emailMessage(s.sysEmail, subject, title, msg));
}

export function emailUserRejectedGdprToAdmin(userEmail: string) {
  const subject = `Odmietnuté GDPR ${userEmail}`;
  const title = subject;
  const msg = `Používateľ ${userEmail} odmietol GDPR.`;
  getAppSettings().then((s) => emailMessage(s.sysEmail, subject, title, msg));
}

export async function emailTeamSizeConfirmed(
  eventId: ObjectId,
  teamId: ObjectId,
  confirmedBy: string
) {
  const teamUrl = getServerConfig().clientAppRootUrl + appPath.team(teamId.toString());
  const team = await teamRepository.findById(teamId).lean().exec();

  const subject = `Veľkosť tímu potvrdená - ${team.name}`;
  const title = subject;
  const msg = `Používateľ ${confirmedBy} potvrdil veľkosť tímu ${team.name}. ${teamUrl}`;

  // email to admin
  getAppSettings().then((s) => emailMessage(s.sysEmail, subject, title, msg));

  // email to event managers
  const event = await eventRepository.findById(eventId).lean().exec();
  const eventManagers = await userRepository
    .find({ _id: { $in: event.managersIds } })
    .lean()
    .exec();
  eventManagers.forEach((m) => emailMessage(m.username, subject, title, msg));
}

//TODO
// notify new program manager -> admin
// notify new event manager -> program mgr, admin
