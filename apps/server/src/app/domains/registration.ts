import { ObjectId } from 'mongodb';
import { getServerConfig } from '../../server-config';
import { ApolloContext } from '../apollo/apollo-context';
import { InvoiceEmailOptions, InvoicingAPI } from './invoicingAPI';
import { InvoicingAPISuperfaktura } from './invoicingAPI-superfaktura';

import { logger } from '@teams2/logger';
import { File, RegistrationInput, RegistrationPayload } from '../_generated/graphql';
import { RegistrationMapper } from '../apollo/mappers';
import {
  eventRepository,
  InvoiceItemData,
  invoiceItemRepository,
  OrderData,
  PricelistEntryData,
  programRepository,
  RegistrationData,
  RegistrationDocument,
  registrationRepository,
  teamRepository,
  userRepository,
} from '../models';
import { getAppSettings } from '../utils/settings';
import { createNote } from './note';
import {
  emailFoodItemChanged,
  emailTeamRegisteredForEvent,
  emailTeamRegisteredForProgram,
  emailTeamUnregisteredFromEvent,
  emailTeamUnregisteredFromProgram,
} from '../utils/emails';
import { appPath } from '@teams2/common';

const logLib = logger('domain:Registration');

export async function createRegistrationInvoice(
  registrationId: ObjectId,
  ctx: ApolloContext,
): Promise<RegistrationPayload> {
  const { dataSources } = ctx;
  const config = getServerConfig();
  const log = logLib.extend('createRegInv');
  log.debug(`registrationId: ${registrationId}`);

  const settings = await getAppSettings();
  const reg = await registrationRepository.findById(registrationId).lean().exec();
  const items = await invoiceItemRepository.find({ registrationId }).lean().exec();

  const team = await teamRepository.findById(reg.teamId).lean().exec();

  // create invoice
  let api: InvoicingAPI;
  if (config.invoicing.type === 'superfaktura') {
    log.debug('using superfaktura');
    api = new InvoicingAPISuperfaktura();
  }
  const invoicePost = api.constructInvoice(
    `Registrácia tímu ${team.name}`,
    reg.billTo,
    reg.shipTo,
    items,
    reg.invoiceNote,
    { email: settings.billingEmail },
  );

  // post invoice
  const result = await api.postInvoice(invoicePost);
  log.debug(`invoice posted: %o`, result);

  if (result.status === 'error') {
    log.error(`invoice post error: %s`, result.error);
    return { errors: [{ code: 'registration_invoice_post_error', message: result.error }] };
  }

  // update registration
  const r = await dataSources.registration.setInvoicedOn(
    reg._id,
    new Date(result.createdOn),
    result.id,
  );
  return { registration: r };
}

export async function emailRegistrationInvoice(
  id: ObjectId,
  ctx: ApolloContext,
): Promise<RegistrationPayload> {
  const { dataSources } = ctx;
  const config = getServerConfig();
  const log = logLib.extend('emailInv');
  log.debug(`id: ${id}`);

  const registration = await registrationRepository.findById(id).lean().exec();
  const team = await teamRepository.findById(registration.teamId).lean().exec();
  const coachEmails = (await dataSources.team.getTeamCoaches(registration.teamId)).map(
    (c) => c.username,
  );

  // invoices will be sent bcc to organization's billing email
  const billingEmail = (await getAppSettings())?.billingEmail ?? '';

  let api: InvoicingAPI;
  if (config.invoicing.type === 'superfaktura') {
    log.debug('using superfaktura');
    api = new InvoicingAPISuperfaktura();
  }

  log.debug('going to send emails to=%s cc=%o', registration.billTo.email, coachEmails);

  const o: InvoiceEmailOptions = {
    id: registration.invoiceRef,
    to: registration.billTo.email ?? '',
    cc: coachEmails.filter((e) => e !== registration.billTo.email),
    subject: `Faktura ${team.name}`,
  };
  if (billingEmail) {
    o.bcc = [billingEmail];
  }

  const result = await api.emailInvoice(o);
  log.debug(`invoice email sent: %o`, result);

  if (result.status === 'error') {
    log.error(`invoice email error: %s`, result.error);
    return { errors: [{ code: 'registration_invoice_email_error', message: result.error }] };
  }

  const text = `Faktúra odoslaná.  \n1. platiteľ: ${
    registration.billTo.email
  }  \n2. tréner: ${coachEmails.join(', ')}  `;

  await createRegistrationNote(id, text, ctx.user._id);

  const ni = await registrationRepository.findOneAndUpdate(
    { _id: id },
    { invoiceSentOn: new Date() },
    { new: true },
  );

  return { registration: RegistrationMapper.toRegistration(ni) };
}

export async function createRegistrationNote(
  registrationId: ObjectId,
  text: string,
  createdBy: ObjectId,
) {
  return await createNote('registration', registrationId, text, createdBy);
}

export async function getRegistrationFiles(
  registrationId: ObjectId,
  ctx: ApolloContext,
): Promise<File[]> {
  const log = logLib.extend('getRegFiles');
  log.debug(`registrationId: ${registrationId}`);
  const registration = await registrationRepository.findById(registrationId).lean().exec();

  let accessAllowed = ctx.userGuard.isAdmin();

  if (!accessAllowed && registration.confirmedOn && !registration.canceledOn) {
    accessAllowed = await ctx.userGuard.isCoach(registration.teamId);
    if (!accessAllowed) {
      log.debug(`not coach regid=${registrationId}`);
      return [];
    }
  }

  if (!accessAllowed) {
    log.debug(`not allowed regid=${registrationId}`);
    return [];
    throw new Error('Access denied getting files for registration');
  }

  const pf = await ctx.dataSources.file.getProgramFiles(registration.programId, false);
  const ef = registration.eventId
    ? await ctx.dataSources.file.getEventFiles(registration.eventId, false)
    : [];
  const f = pf.concat(ef).sort((a, b) => a.name.localeCompare(b.name));

  log.debug(`returning ${f.length} files for registration ${registrationId}`);

  return f;
}

export async function cancelRegistration(
  id: ObjectId,
  ctx: ApolloContext,
): Promise<RegistrationPayload> {
  const { dataSources, userGuard } = ctx;
  const log = logLib.extend('cancelRegistration');
  const reg = await dataSources.registration.getRegistration(id);

  if (
    !userGuard.isAdmin() &&
    reg.canceledOn &&
    !((await userGuard.isCoach(reg.teamId)) && !reg.confirmedOn) &&
    !(reg.programId && (await userGuard.isProgramManager(reg.programId))) &&
    !(reg.eventId && (await userGuard.isEventManager(reg.eventId)))
  ) {
    log.debug('Not authorized to cancel registration %s', id);
    return { errors: [{ code: 'not_authorized' }] };
  }

  const registration = await dataSources.registration.cancelRegistration(id);

  if (!registration) {
    return null;
  }

  // email notifications
  if (registration.eventId) {
    emailTeamUnregisteredFromEvent(registration.id);
  } else {
    emailTeamUnregisteredFromProgram(registration.id);
  }

  return { registration };
}

export async function registerTeamToEvent(
  teamId: ObjectId,
  eventId: ObjectId,
  input: RegistrationInput,
  ctx: ApolloContext,
): Promise<RegistrationPayload> {
  const log = logLib.extend('registerTeam');
  log.info('Registering team %s to event %s', teamId, eventId);
  const { userGuard } = ctx;

  if (!userGuard.isAdmin() && !(await userGuard.isCoach(teamId))) {
    log.error('Not authorized to register');
    return { errors: [{ code: 'not_authorized' }] };
  }

  let registration: RegistrationData;
  try {
    // register team to event
    registration = await createEventRegistration(eventId, teamId, input, ctx);

    if (!registration) {
      return { errors: [{ code: 'registration_failed' }] };
    }
  } catch (e) {
    return { errors: [{ code: 'registration_failed' }, { code: e.name }] };
  }

  try {
    // copy invoice items to registration
    await copyInvoiceItemsToRegistration(registration._id);
  } catch (e) {
    log.error('Failed to copy invoice items to registration %s', registration._id);
    return { errors: [{ code: 'registration_failed_to_copy_items' }, { code: e.name }] };
  }

  try {
    // email notifications
    emailTeamRegisteredForEvent(registration._id);
  } catch (e) {
    log.error('Failed to send email to team %s', teamId);
    return { errors: [{ code: 'registration_failed_to_send_email' }, { code: e.name }] };
  }

  return { registration: RegistrationMapper.toRegistration(registration) };
}

export async function registerTeamToProgram(
  teamId: ObjectId,
  programId: ObjectId,
  input: RegistrationInput,
  ctx: ApolloContext,
): Promise<RegistrationPayload> {
  const log = logLib.extend('registerTeam');
  log.info('Registering team %s to program %s', teamId, programId);
  const { userGuard } = ctx;

  if (!userGuard.isAdmin() && !(await userGuard.isCoach(teamId))) {
    log.error('Not authorized to register');
    return { errors: [{ code: 'not_authorized' }] };
  }

  let registration: RegistrationData;
  try {
    // register team to event
    registration = await createProgramRegistration(programId, teamId, input, ctx);

    if (!registration) {
      return { errors: [{ code: 'registration_failed' }] };
    }
  } catch (e) {
    log.error(
      'Error while registering team %s to program %s. Error: %s',
      teamId,
      programId,
      e.message,
    );
    return { errors: [{ code: 'registration_failed' }, { code: e.name }] };
  }

  try {
    // copy invoice items to registration
    await copyInvoiceItemsToRegistration(registration._id);
  } catch (e) {
    log.error('Failed to copy invoice items to registration %s', registration._id);
    return { errors: [{ code: 'registration_failed_to_copy_items' }, { code: e.name }] };
  }

  try {
    // email notifications
    emailTeamRegisteredForProgram(registration._id);
  } catch (e) {
    log.error('Failed to send email to team %s', teamId);
    return { errors: [{ code: 'registration_failed_to_send_email' }, { code: e.name }] };
  }

  return { registration: RegistrationMapper.toRegistration(registration) };
}

async function copyInvoiceItemsToRegistration(registrationId: ObjectId) {
  const reg = await registrationRepository.findById(registrationId).lean().exec();
  const q: Partial<InvoiceItemData> = {};
  if (reg.eventId) {
    q.eventId = reg.eventId;
  }
  if (reg.programId) {
    q.programId = reg.programId;
  }

  const items = await invoiceItemRepository.find(q).lean().exec();

  for (const item of items) {
    const ri: InvoiceItemData = {
      registrationId,
      lineNo: item.lineNo,
      text: item.text,
      note: item.note,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    };
    await invoiceItemRepository.create(ri);
  }
}

export async function createEventRegistration(
  eventId: ObjectId,
  teamId: ObjectId,
  input: RegistrationInput,
  ctx: ApolloContext,
): Promise<RegistrationData> {
  const log = logLib.extend('createEventRegistration');
  ctx.userGuard.isAdmin() ||
    ctx.userGuard.isCoach(teamId) ||
    ctx.userGuard.notAuthorized('Create event registration');

  // check if team is not already registered
  const r = await registrationRepository.groupRegistrations({ eventId, teamId, active: true });
  log.debug('Registrations count teamId=%s count=%d', teamId.toHexString(), r);
  if (r.length > 0) {
    throw { name: 'team_already_registered' };
  }

  const event = await eventRepository.findById(eventId).exec();
  if (!event) {
    log.warn('Event not found teamId=%s eventId=%s', teamId.toHexString(), eventId.toHexString());
    throw { name: 'event_not_found' };
  }

  if (
    event.maxTeams &&
    (await registrationRepository.groupRegistrations({ eventId, active: true })).length >=
      event.maxTeams
  ) {
    throw { name: 'event_full' };
  }

  const team = await teamRepository.findById(teamId).exec();
  if (!team) {
    throw { name: 'team_not_found' };
  }

  const newReg: RegistrationData = {
    programId: event.programId,
    eventId,
    teamId,
    createdOn: new Date(),
    createdBy: ctx.user._id,
    shipTo: team.shipTo,
    billTo: team.billTo,
    type: input.type,
    teamsImpacted: 0,
    setCount: 0,
  };

  const registration = new registrationRepository(newReg);
  await registration.save();
  return registration;
}

export async function createProgramRegistration(
  programId: ObjectId,
  teamId: ObjectId,
  input: RegistrationInput,
  ctx: ApolloContext,
): Promise<RegistrationData> {
  const log = logLib.extend('createProgramRegistration');
  ctx.userGuard.isAdmin() ||
    ctx.userGuard.isCoach(teamId) ||
    ctx.userGuard.notAuthorized('Create program registration');

  // check if team is not already registered
  const r = await registrationRepository.groupRegistrations({
    programId,
    teamId,
    active: true,
  });
  log.debug('Registrations count teamId=%s count=%d', teamId.toHexString(), r);
  if (r.length > 0) {
    throw { name: 'team_already_registered' };
  }

  const team = await teamRepository.findById(teamId).exec();
  if (!team) {
    throw { name: 'team_not_found' };
  }

  const newReg: RegistrationData = {
    programId: programId,
    teamId,
    createdOn: new Date(),
    createdBy: ctx.user._id,
    shipTo: team.shipTo,
    billTo: team.billTo,
    type: input.type,
    teamsImpacted: 1,
    setCount: 1,
  };

  if (input.type === 'CLASS_PACK') {
    newReg.setCount = input.setCount;
    newReg.childrenImpacted = input.impactedChildrenCount;
    newReg.teamsImpacted = input.impactedTeamCount;
  }

  const registration = new registrationRepository(newReg);
  await registration.save();
  return registration;
}

export async function issueFoodInvoice(
  registrationId: ObjectId,
  ctx: ApolloContext,
): Promise<RegistrationPayload> {
  const { dataSources } = ctx;
  const config = getServerConfig();
  const log = logLib.extend('createFoodInv');
  log.debug(`registrationId: ${registrationId}`);

  const settings = await getAppSettings();
  const reg = await registrationRepository.findById(registrationId).lean().exec();
  const items = await invoiceItemRepository.find({ registrationId }).lean().exec();

  const team = await teamRepository.findById(reg.teamId).lean().exec();

  // create invoice
  let api: InvoicingAPI;
  if (config.invoicing.type === 'superfaktura') {
    log.debug('using superfaktura');
    api = new InvoicingAPISuperfaktura();
  }
  const invoicePost = api.constructInvoice(
    `Stravovanie tímu ${team.name}`,
    reg.billTo,
    reg.shipTo,
    items,
    reg.invoiceNote,
    { email: settings.billingEmail },
  );

  // post invoice
  const result = await api.postInvoice(invoicePost);
  log.debug(`invoice posted: %o`, result);

  if (result.status === 'error') {
    log.error(`invoice post error: %s`, result.error);
    return { errors: [{ code: 'food_invoice_post_error', message: result.error }] };
  }

  // update registration
  const r = await dataSources.registration.setInvoicedOn(
    reg._id,
    new Date(result.createdOn),
    result.id,
  );
  return { registration: r };
}

export async function emailFoodInvoice(
  id: ObjectId,
  ctx: ApolloContext,
): Promise<RegistrationPayload> {
  const { dataSources } = ctx;
  const config = getServerConfig();
  const log = logLib.extend('emailFoodInv');
  log.debug(`id: ${id}`);

  const registration = await registrationRepository.findById(id).lean().exec();
  if (!registration) {
    log.error('registration not found %s', id);
    return { errors: [{ code: 'registration_not_found' }] };
  }
  if (!registration.foodOrder?.invoiceRef) {
    log.error('food order invoice not found %s', id);
    return { errors: [{ code: 'food_invoice_not_found' }] };
  }

  const team = await teamRepository.findById(registration.teamId).lean().exec();
  const coachEmails = (await dataSources.team.getTeamCoaches(registration.teamId)).map(
    (c) => c.username,
  );

  // invoices will be sent bcc to organization's billing email
  const billingEmail = (await getAppSettings())?.billingEmail ?? '';

  let api: InvoicingAPI;
  if (config.invoicing.type === 'superfaktura') {
    log.debug('using superfaktura');
    api = new InvoicingAPISuperfaktura();
  }

  log.debug('going to send emails to=%s cc=%o', registration.billTo.email, coachEmails);

  const o: InvoiceEmailOptions = {
    id: registration.foodOrder?.invoiceRef,
    to: registration.billTo.email ?? '',
    cc: coachEmails.filter((e) => e !== registration.billTo.email),
    subject: `Faktura ${team.name}`,
  };
  if (billingEmail) {
    o.bcc = [billingEmail];
  }

  const result = await api.emailInvoice(o);
  log.debug(`invoice email sent: %o`, result);

  if (result.status === 'error') {
    log.error(`invoice email error: %s`, result.error);
    return { errors: [{ code: 'food_invoice_email_error', message: result.error }] };
  }

  const text = `Faktúra za stravovanie odoslaná.  \n1. platiteľ: ${
    registration.billTo.email
  }  \n2. tréner: ${coachEmails.join(', ')}  `;

  await createRegistrationNote(id, text, ctx.user._id);

  const ni = await registrationRepository.findOneAndUpdate(
    { _id: id },
    { invoiceSentOn: new Date() },
    { new: true },
  );

  return { registration: RegistrationMapper.toRegistration(ni) };
}

export async function modifyFoodOrderItem(
  reg: RegistrationDocument,
  changes: PricelistEntryData,
  changedBy: ObjectId,
) {
  const log = logLib.extend('modifyFoodOrderItem');
  log.info('Modifying registration %s, changes=%o', reg._id, changes);

  if (!reg.foodOrder) {
    log.error('Food order not found in registration %s', reg._id);
    return { errors: [{ code: 'food_order_not_found' }] };
  }

  const item = reg.foodOrder.items.find((i) => i.productId.equals(changes._id));

  if (!item) {
    log.error('Food item not found in food order %s', changes._id);
    return { errors: [{ code: 'food_item_not_found' }] };
  }

  const oldItem: OrderData['items'][0] = {
    _id: item._id,
    productId: item.productId,
    name: item.name,
    unitPrice: item.unitPrice,
    price: item.price,
    quantity: item.quantity,
  };

  log.info('Modifying food item %o', oldItem._id, oldItem.name);

  item.unitPrice = changes.up;
  item.price = Math.round(item.quantity * item.unitPrice * 100) / 100;
  item.name = changes.n;

  await reg.save();

  notifyFoodItemChanged(reg, oldItem, item, changedBy);
}

export async function notifyFoodItemChanged(
  reg: RegistrationData,
  oldItem: OrderData['items'][0],
  changes: Omit<OrderData['items'][0], '_id'>,
  changedBy: ObjectId,
): Promise<RegistrationPayload> {
  const log = logLib.extend('notifyFoodItemChanged');
  log.debug(`id: ${reg._id}`);

  const registration = reg;

  if (!registration) {
    log.error('registration not found %s', reg);
    return { errors: [{ code: 'registration_not_found' }] };
  }
  if (!registration.foodOrder) {
    log.error('food order not found %s', reg);
    return { errors: [{ code: 'food_order_not_found' }] };
  }

  const team = await teamRepository.findById(registration.teamId).lean().exec();
  const coachEmails = (await userRepository.find({ _id: { $in: team.coachesIds } })).map(
    (c) => c.username,
  );
  const event = await eventRepository.findById(registration.eventId).lean().exec();
  const program = await programRepository.findById(registration.programId).lean().exec();

  log.debug('going to send emails to=%s cc=%o', registration.billTo.email, coachEmails);

  const regUrl =
    getServerConfig().clientAppRootUrl + appPath.registration(registration._id.toHexString());

  emailFoodItemChanged({
    emails: coachEmails,
    eventName: event.name,
    programName: program.name,
    oldItem,
    changes,
    regUrl,
  });

  const text = `Položka objednávky jedla zmenená usporiadateľom.  \n1. stará: ${
    oldItem.name
  }, ${oldItem.unitPrice} EUR  \n2. nová: ${changes.name}, ${changes.unitPrice} EUR  `;

  await createRegistrationNote(registration._id, text, changedBy);
}
