import { ObjectId } from 'mongodb';
import { getServerConfig } from '../../server-config';
import { RegisterTeamInput, Event } from '../generated/graphql';
import { EventMapper } from '../graphql/mappers';
import {
  EventDocument,
  eventRepository,
  ProgramDocument,
  programRepository,
  teamRepository,
} from '../models';
import { InvoicingAPI } from './invoicingAPI';
import { InvoicingAPISuperfaktura } from './invoicingAPI-superfaktura';
import { logger } from '@teams2/logger';
import { Debugger } from 'debug';

export class EventBL {
  public data: EventDocument;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public config: any;
  protected log;
  protected program: ProgramDocument | null = null;

  constructor(event: EventDocument) {
    this.data = event;
    this.config = getServerConfig();
    this.log = logger('EventBL');
  }

  static async load(eventId: ObjectId): Promise<EventBL | null> {
    const ev = await eventRepository.findById(eventId).exec();
    return ev ? new EventBL(ev) : null;
  }

  async save() {
    await this.data.save();
  }

  async loadProgram() {
    if (!this.program) {
      this.program = await programRepository.findOne({ _id: this.data.programId }).exec();
    }
  }

  toEvent(): Event {
    return EventMapper.toEvent(this.data);
  }

  public async registerTeam(input: RegisterTeamInput) {
    const { teamId } = input;
    this.log.debug(`registerTeam: ${teamId}`);
    // add team to event
    if (!this.data.teamsIds.find((t) => t.equals(teamId))) {
      this.data.teamsIds.push(teamId);
      await this.save();
    }

    // load team
    const team = await teamRepository.findById(teamId).exec();

    // load program
    await this.loadProgram();

    // create invoice
    let api: InvoicingAPI;
    if (this.config.invoicing.type === 'superfaktura') {
      this.log.debug('using superfaktura');
      api = new InvoicingAPISuperfaktura();
    }
    const invoice = api.constructInvoice(
      team.name,
      team.billTo,
      team.shipTo,
      this.data.invoiceItems.length > 0 ? this.data.invoiceItems : this.program.invoiceItems
    );
    this.log.debug(`invoice: ${JSON.stringify(invoice)}`);

    // post invoice
    const result = await api.postInvoice(invoice);
    this.log.debug(`invoice posted: %o`, result);

    // email invoice
    if (result.status === 'ok') {
      const sendResult = await api.emailInvoice({
        id: result.id,
        to: team.billTo.email,
        subject: `Faktura ${this.data.name}`,
      });
      this.log.debug(`invoice email sent: %o`, sendResult);
    }
    return result;
  }
}


export function createInvoicepublic async registerTeam(input: RegisterTeamInput) {
  const { teamId } = input;
  this.log.debug(`registerTeam: ${teamId}`);
  // add team to event
  if (!this.data.teamsIds.find((t) => t.equals(teamId))) {
    this.data.teamsIds.push(teamId);
    await this.save();
  }

  // load team
  const team = await teamRepository.findById(teamId).exec();

  // load program
  await this.loadProgram();

  // create invoice
  let api: InvoicingAPI;
  if (this.config.invoicing.type === 'superfaktura') {
    this.log.debug('using superfaktura');
    api = new InvoicingAPISuperfaktura();
  }
  const invoice = api.constructInvoice(
    team.name,
    team.billTo,
    team.shipTo,
    this.data.invoiceItems.length > 0 ? this.data.invoiceItems : this.program.invoiceItems
  );
  this.log.debug(`invoice: ${JSON.stringify(invoice)}`);

  // post invoice
  const result = await api.postInvoice(invoice);
  this.log.debug(`invoice posted: %o`, result);

  // email invoice
  if (result.status === 'ok') {
    const sendResult = await api.emailInvoice({
      id: result.id,
      to: team.billTo.email,
      subject: `Faktura ${this.data.name}`,
    });
    this.log.debug(`invoice email sent: %o`, sendResult);
  }
  return result;
}
