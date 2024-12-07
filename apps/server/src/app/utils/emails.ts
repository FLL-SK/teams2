import { appPath } from '@teams2/common';
import { ObjectId } from 'mongodb';
import { getServerConfig } from '../../server-config';
import {
  eventRepository,
  programRepository,
  RegistrationData,
  registrationRepository,
  teamRepository,
  userRepository,
} from '../models';
import { msgFromTemplate, msgPasswordReset } from './messages';
import { getAppSettings } from './settings';

import { logger } from '@teams2/logger';
import { sendEmail } from './mailer';

const logLib = logger('domain:email');

interface EmailMessageProps {
  to: string;
  cc?: string;
  title: string;
  subject: string;
  html?: string;
  text?: string;
}

export function emailMessage({ to, subject, title, text, cc }: EmailMessageProps) {
  msgFromTemplate(title, text).then((html) =>
    sendEmail({ to, subject, html, cc })
      .then(() => {
        logLib.debug('emailMessage: email sent');
      })
      .catch((e) => {
        logLib.error('emailMessage: error sending email', e);
      }),
  );
}

export function emailPasswordReset(email: string, token: string) {
  // send email
  msgPasswordReset(email, token).then((html) =>
    sendEmail({ to: email, subject: 'Password reset', html })
      .then(() => {
        logLib.debug('emailPasswordReset: email sent');
      })
      .catch((e) => {
        logLib.error('emailPasswordReset: error sending email', e);
      }),
  );
}

export function emailUserSignupToUser(to: string) {
  const subject = 'Účet bol vytvorený';
  const title = subject;
  const text = `Účet pre email ${to} bol vytvorený.`;
  emailMessage({ to, subject, title, text });
}

export function emailUserSignupToAdmin(to: string) {
  const subject = `Nový účet ${to}`;
  const title = subject;
  const text = `Účet pre email ${to} bol vytvorený.`;
  getAppSettings().then((s) => emailMessage({ to: s.sysEmail, subject, title, text }));
}

export function emailEventChangedToCoach(
  emails: string[],
  teamName: string,
  eventName: string,
  programName: string,
  eventUrl: string,
) {
  const subject = `Zmena na turnaji ${eventName}`;
  const title = subject;
  const text = `Turnaj ${eventName} programu ${programName}, na ktorý je váš tím ${teamName} regitrovaný, bol zmenený. Viac informácií o turnaji nájdete tu ${eventUrl}`;
  emails.forEach((to) => emailMessage({ to, subject, title, text }));
}

export function emailEventChangedToEventManagers(
  emails: string[],
  eventName: string,
  programName: string,
  eventUrl: string,
) {
  const subject = `Zmena turnaja ${eventName}`;
  const title = subject;
  const text = `Turnaj turnaj ${eventName} programu ${programName} bol zmenený. Viac informácií o turnaji nájdete tu ${eventUrl}`;
  emails.forEach((to) => emailMessage({ to, subject, title, text }));
}

export async function emailEventManagerAdded(eventId: ObjectId, userId: ObjectId) {
  const ev = await eventRepository.findById(eventId).lean().exec();
  const user = await userRepository.findById(userId).lean().exec();

  const eventUrl = getServerConfig().clientAppRootUrl + appPath.event(eventId.toHexString());
  const subject = `Pridaný manažér pre turnaj ${ev.name}`;
  const title = subject;
  const text = `Používateľ ${user.username} (${user.firstName} ${user.lastName}) bol pridaný ako manažér turnaja ${ev.name}. Viac informácií o turnaji nájdete tu ${eventUrl}`;

  // send to admin
  getAppSettings().then((s) => emailMessage({ to: s.sysEmail, subject, title, text }));

  // send to event managers
  const eventManagers = await userRepository
    .find({ _id: { $in: ev.managersIds } })
    .lean()
    .exec();
  eventManagers.forEach((m) => emailMessage({ to: m.username, subject, title, text }));
}

export async function emailProgramManagerAdded(programId: ObjectId, userId: ObjectId) {
  const prg = await programRepository.findById(programId).lean().exec();
  const user = await userRepository.findById(userId).lean().exec();

  const url = getServerConfig().clientAppRootUrl + appPath.program(programId.toHexString());
  const subject = `Pridaný manažér pre program ${prg.name}`;
  const title = subject;
  const text = `Používateľ ${user.username} (${user.firstName} ${user.lastName}) bol pridaný ako manažér programu ${prg.name}. Viac informácií o programe nájdete tu ${url}`;

  // send to admin
  getAppSettings().then((s) => {
    if (s.sysEmail) {
      emailMessage({ to: s.sysEmail, subject, title, text });
    } else {
      logLib.error('emailProgramManagerAdded: no sysEmail in settings');
    }
  });

  // send to program managers
  const managers = await userRepository
    .find({ _id: { $in: prg.managersIds } })
    .lean()
    .exec();
  managers.forEach((m) => emailMessage({ to: m.username, subject, title, text }));
}

export function emailUserAcceptedGdprToAdmin(userEmail: string) {
  const subject = `Akceptované GDPR ${userEmail}`;
  const title = subject;
  const text = `Používateľ ${userEmail} akceptoval GDPR.`;
  getAppSettings().then((s) => {
    if (s.sysEmail) {
      emailMessage({ to: s.sysEmail, subject, title, text });
    } else {
      logLib.error('emailUserAcceptedGdprToAdmin: no sysEmail in settings');
    }
  });
}

export function emailUserRejectedGdprToAdmin(userEmail: string) {
  const subject = `Odmietnuté GDPR ${userEmail}`;
  const title = subject;
  const text = `Používateľ ${userEmail} odmietol GDPR.`;
  getAppSettings().then((s) => {
    if (s.sysEmail) {
      emailMessage({ to: s.sysEmail, subject, title, text });
    } else {
      logLib.error('emailUserRejectedGdprToAdmin: no sysEmail in settings');
    }
  });
}

export async function emailTeamSizeConfirmed(
  eventId: ObjectId,
  teamId: ObjectId,
  confirmedBy: string,
) {
  const teamUrl = getServerConfig().clientAppRootUrl + appPath.team(teamId.toString());
  const team = await teamRepository.findById(teamId).lean().exec();

  const subject = `Veľkosť tímu potvrdená - ${team.name}`;
  const title = subject;
  const text = `Používateľ ${confirmedBy} potvrdil veľkosť tímu ${team.name}. ${teamUrl}`;

  // email to admin
  getAppSettings().then((s) => {
    if (s.sysEmail) {
      emailMessage({ to: s.sysEmail, subject, title, text });
    } else {
      logLib.error('emailTeamSizeConfirmed: no sysEmail in settings');
    }
  });

  // email to event managers
  const event = await eventRepository.findById(eventId).lean().exec();
  const eventManagers = await userRepository
    .find({ _id: { $in: event.managersIds } })
    .lean()
    .exec();
  eventManagers.forEach((m) => emailMessage({ to: m.username, subject, title, text }));
}

export async function emailFoodOrderUpdated(registration: RegistrationData, updatedBy: string) {
  const registrationUrl =
    getServerConfig().clientAppRootUrl + appPath.registration(registration._id.toString());
  const team = await teamRepository.findById(registration.teamId).lean().exec();

  const subject = `Objednávka stravy - ${team.name}`;
  const title = subject;
  const text = `Používateľ ${updatedBy} objednal stravovanie pre tímu ${team.name}. ${registrationUrl}`;

  // email to admin
  getAppSettings().then((s) => {
    if (s.sysEmail) {
      emailMessage({ to: s.sysEmail, subject, title, text });
    } else {
      logLib.error('emailFoodOrderUpdated: no sysEmail in settings');
    }
  });

  // email to event managers
  const event = await eventRepository.findById(registration.eventId).lean().exec();
  const eventManagers = await userRepository
    .find({ _id: { $in: event.managersIds } })
    .lean()
    .exec();
  eventManagers.forEach((m) => emailMessage({ to: m.username, subject, title, text }));
}

export async function emailEventRegistrationConfirmed(
  eventId: ObjectId,
  teamId: ObjectId,
  confirmedBy: string,
) {
  const log = logLib.extend('emailRegistrationConfirmedEvent');
  const teamUrl = getServerConfig().clientAppRootUrl + appPath.team(teamId.toString());
  const team = await teamRepository.findById(teamId).lean().exec();

  const subject = `Registrácia tímu na turnaj potvrdená - ${team.name}`;
  const title = subject;
  const text = `Organizátor turnaja potvrdil registráciu tímu ${team.name}. ${teamUrl}`;

  // email to admin

  getAppSettings().then((s) => {
    if (!s.sysEmail) {
      log.error('emailRegistrationConfirmed: no sysEmail in settings');
      return;
    }
    emailMessage({ to: s.sysEmail, subject, title, text: text + '\n\n Potvrdené:' + confirmedBy });
    log.debug('email sent to admin %s', s.sysEmail);
  });

  // email to event managers
  const event = await eventRepository.findById(eventId).lean().exec();
  const eventManagers = await userRepository
    .find({ _id: { $in: event.managersIds } }, { username: 1 })
    .lean()
    .exec();
  eventManagers.forEach((m) => emailMessage({ to: m.username, subject, title, text }));
  log.debug(
    'email sent to event managers %s',
    eventManagers.map((m) => m.username),
  );

  // email to coaches
  const coaches = await userRepository
    .find({ _id: { $in: team.coachesIds } }, { username: 1 })
    .lean()
    .exec();
  coaches.forEach((m) => emailMessage({ to: m.username, subject, title, text }));
}

export async function emailProgramRegistrationConfirmed(
  programId: ObjectId,
  teamId: ObjectId,
  confirmedBy: string,
) {
  const log = logLib.extend('emailRegistrationConfirmedProg');
  const teamUrl = getServerConfig().clientAppRootUrl + appPath.team(teamId.toString());
  const team = await teamRepository.findById(teamId).lean().exec();

  const subject = `Registrácia tímu do programu potvrdená - ${team.name}`;
  const title = subject;
  const text = `Organizátor programu potvrdil registráciu tímu ${team.name}. ${teamUrl}`;

  // email to admin

  getAppSettings().then((s) => {
    if (!s.sysEmail) {
      log.error('emailRegistrationConfirmed: no sysEmail in settings');
      return;
    }
    emailMessage({ to: s.sysEmail, subject, title, text: text + '\n\n Potvrdené:' + confirmedBy });
    log.debug('email sent to admin %s', s.sysEmail);
  });

  // email to program managers
  const program = await programRepository.findById(programId).lean().exec();
  const programManagers = await userRepository
    .find({ _id: { $in: program.managersIds } }, { username: 1 })
    .lean()
    .exec();
  programManagers.forEach((m) => emailMessage({ to: m.username, subject, title, text }));
  log.debug(
    'email sent to event managers %s',
    programManagers.map((m) => m.username),
  );

  // email to coaches
  const coaches = await userRepository
    .find({ _id: { $in: team.coachesIds } }, { username: 1 })
    .lean()
    .exec();
  coaches.forEach((m) => emailMessage({ to: m.username, subject, title, text }));
}

export async function emailTeamRegisteredForEvent(registrationId: ObjectId) {
  const log = logLib.extend('emailTeamRegisteredEvent');

  const reg = await registrationRepository.findById(registrationId).lean().exec();
  const [team, event, program] = await Promise.all([
    teamRepository.findById(reg.teamId).lean().exec(),
    eventRepository.findById(reg.eventId).lean().exec(),
    programRepository.findById(reg.programId).lean().exec(),
  ]);

  const eventUrl = getServerConfig().clientAppRootUrl + appPath.event(event._id.toString());

  const coaches = await userRepository
    .find({ _id: { $in: team.coachesIds } }, { username: 1 })
    .lean()
    .exec();

  const em = await userRepository
    .find({ _id: { $in: event.managersIds } }, { username: 1 })
    .lean()
    .exec();

  const pm = await userRepository
    .find({ _id: { $in: program.managersIds } }, { username: 1 })
    .lean()
    .exec();

  const managers = em.concat(pm);

  const subject = `Registrácia tímu ${team.name} na turnaj ${event.name}`;
  const title = subject;
  const text = `Tím ${team.name} bol úspešne zaregistrovaný na turnaj ${event.name} programu ${program.name}. Viac informácií o turnaji nájdete tu ${eventUrl}`;

  coaches.forEach((m) => emailMessage({ to: m.username, subject, title, text }));
  log.debug(
    'email sent to coaches %o',
    coaches.map((m) => m.username),
  );

  managers.forEach((m) => emailMessage({ to: m.username, subject, title, text }));
  log.debug(
    'email sent to managers %o',
    managers.map((m) => m.username),
  );
}

export async function emailTeamRegisteredForProgram(registrationId: ObjectId) {
  const log = logLib.extend('emailTeamRegisteredPrg');

  const reg = await registrationRepository.findById(registrationId).lean().exec();
  const [team, program] = await Promise.all([
    teamRepository.findById(reg.teamId).lean().exec(),
    programRepository.findById(reg.programId).lean().exec(),
  ]);

  const programUrl = getServerConfig().clientAppRootUrl + appPath.program(program._id.toString());

  const coaches = await userRepository
    .find({ _id: { $in: team.coachesIds } }, { username: 1 })
    .lean()
    .exec();

  const pm = await userRepository
    .find({ _id: { $in: program.managersIds } }, { username: 1 })
    .lean()
    .exec();

  const managers = pm;

  const subject = `Registrácia tímu ${team.name} do programu ${program.name}`;
  const title = subject;
  const text = `Tím ${team.name} bol úspešne zaregistrovaný do programu ${program.name}. Viac informácií o programe nájdete tu ${programUrl}`;

  coaches.forEach((m) => emailMessage({ to: m.username, subject, title, text }));
  log.debug(
    'email sent to coaches %o',
    coaches.map((m) => m.username),
  );

  managers.forEach((m) => emailMessage({ to: m.username, subject, title, text }));
  log.debug(
    'email sent to managers %o',
    managers.map((m) => m.username),
  );
}

export async function emailTeamUnregisteredFromEvent(registrationId: ObjectId) {
  const log = logLib.extend('emailTeamUnregisteredEvent');

  const reg = await registrationRepository.findById(registrationId).lean().exec();
  const [team, event, program] = await Promise.all([
    teamRepository.findById(reg.teamId).lean().exec(),
    eventRepository.findById(reg.eventId).lean().exec(),
    programRepository.findById(reg.programId).lean().exec(),
  ]);

  const eventUrl = getServerConfig().clientAppRootUrl + appPath.event(event._id.toString());

  const coaches = await userRepository
    .find({ _id: { $in: team.coachesIds } }, { username: 1 })
    .lean()
    .exec();

  const em = await userRepository
    .find({ _id: { $in: event.managersIds } }, { username: 1 })
    .lean()
    .exec();

  const pm = await userRepository
    .find({ _id: { $in: program.managersIds } }, { username: 1 })
    .lean()
    .exec();

  const managers = em.concat(pm);
  const coachEmails = coaches.map((c) => c.username);

  const subject = `Zrušenie registrácia tímu ${team.name}`;
  const title = subject;
  const text = `Registrácia tímu ${team.name} turnaj ${event.name} programu ${program.name} bola zrušená. Viac informácií o turnaji nájdete tu ${eventUrl}`;

  coachEmails.forEach((to) => emailMessage({ to, subject, title, text }));
  log.debug(
    'email sent to coaches %o',
    coaches.map((m) => m.username),
  );

  managers.forEach((m) => emailMessage({ to: m.username, subject, title, text }));
  log.debug(
    'email sent to managers %o',
    managers.map((m) => m.username),
  );
}

export async function emailTeamUnregisteredFromProgram(registrationId: ObjectId) {
  const log = logLib.extend('emailTeamUnregisteredPrg');

  const reg = await registrationRepository.findById(registrationId).lean().exec();
  const [team, program] = await Promise.all([
    teamRepository.findById(reg.teamId).lean().exec(),
    programRepository.findById(reg.programId).lean().exec(),
  ]);

  const programUrl = getServerConfig().clientAppRootUrl + appPath.program(program._id.toString());

  const coaches = await userRepository
    .find({ _id: { $in: team.coachesIds } }, { username: 1 })
    .lean()
    .exec();

  const pm = await userRepository
    .find({ _id: { $in: program.managersIds } }, { username: 1 })
    .lean()
    .exec();

  const managers = pm;
  const coachEmails = coaches.map((c) => c.username);

  const subject = `Zrušenie registrácia tímu ${team.name}`;
  const title = subject;
  const text = `Registrácia tímu ${team.name} v programe ${program.name} bola zrušená. Viac informácií o programe nájdete tu ${programUrl}`;

  coachEmails.forEach((to) => emailMessage({ to, subject, title, text }));
  log.debug(
    'email sent to coaches %o',
    coaches.map((m) => m.username),
  );

  managers.forEach((m) => emailMessage({ to: m.username, subject, title, text }));
  log.debug(
    'email sent to managers %o',
    managers.map((m) => m.username),
  );
}
