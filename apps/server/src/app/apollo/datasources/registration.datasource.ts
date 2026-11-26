import { BaseDataSource } from './_base.datasource';
import { fireAndForget } from '../../utils/fire-and-forget';
import {
  eventRepository,
  programRepository,
  RegistrationData,
  RegistrationGroup,
  registrationRepository,
  teamRepository,
  userRepository,
} from '../../models';
import {
  OrderInput,
  RegisteredTeamPayload,
  Registration,
  RegistrationFilter,
  RegistrationInput,
  RegistrationPayload,
  TeamSizeInput,
} from '../../_generated/graphql';
import { OrderMapper, RegistrationMapper } from '../mappers';
import { ObjectId } from 'mongodb';
import Dataloader from 'dataloader';
import {
  emailTeamSizeConfirmed,
  emailEventRegistrationConfirmed,
  emailProgramRegistrationConfirmed,
  emailFoodOrderUpdated,
  emailFoodOrderRemoved,
} from '../../utils/emails';
import { QueryFilter, UpdateQuery } from 'mongoose';
import { OrderData } from '../../models/order.model';
import { formatTeamNo } from '../../utils/format-teamNo';
import { priceFoodOrderItems } from '../../domains/registration-rules';

export class RegistrationDataSource extends BaseDataSource {
  declare private loader: Dataloader<string, Registration, string>;

  protected override _initialize() {
    this.loader = new Dataloader(this.loaderFn.bind(this));
  }

  private async loaderFn(ids: string[]): Promise<Registration[]> {
    const oids = ids.map((id) => new ObjectId(id));
    const rec = await registrationRepository.find({ _id: { $in: ids } }).exec();
    const data = oids.map((id) => rec.find((e) => e._id.equals(id)) ?? null);
    return data.map(RegistrationMapper.toRegistration.bind(this));
  }

  async getRegistration(id: ObjectId): Promise<Registration> {
    if (!id) return null;
    const reg = await this.loader.load(id.toString());
    // registráciu vidí iba admin, tréner tímu a správca programu/turnaja (#289)
    if (!reg || !(await this.userGuard.canReadRegistration(reg))) {
      return null;
    }
    return reg;
  }

  /** ponechá iba registrácie, ktoré smie používateľ čítať (#289) */
  private async onlyReadable(regs: Registration[]): Promise<Registration[]> {
    if (this.userGuard.isAdmin()) {
      return regs;
    }
    const allowed = await Promise.all(regs.map((r) => this.userGuard.canReadRegistration(r)));
    return regs.filter((_r, i) => allowed[i]);
  }

  async getRegistrations(filter: RegistrationFilter): Promise<Registration[]> {
    const q: QueryFilter<RegistrationData> = {};
    if (filter.active) {
      q.canceledOn = null;
    }
    if (filter.programId) {
      q.programId = filter.programId;
    }
    if (filter.eventId) {
      q.eventId = filter.eventId;
    }
    if (filter.teamId) {
      q.teamId = filter.teamId;
    }
    const regs = await registrationRepository.find(q).exec();
    return this.onlyReadable(regs.map(RegistrationMapper.toRegistration));
  }

  async getRegistrationGroups(filter: RegistrationFilter): Promise<RegistrationGroup[]> {
    // TODO: candidate for dataloader
    const regsCount = await registrationRepository.groupRegistrations(filter);
    return regsCount;
  }

  async updateRegistration(id: ObjectId, input: RegistrationInput): Promise<Registration> {
    await this.userGuard.require('Update registration', this.userGuard.isAdmin());
    const u: UpdateQuery<RegistrationData> = {
      type: input.type,
      childrenImpacted: input.impactedChildrenCount,
      teamsImpacted: input.impactedTeamCount,
      setCount: input.setCount,
    };
    const registration = await registrationRepository
      .findByIdAndUpdate(id, u, { returnDocument: 'after' })
      .exec();
    return RegistrationMapper.toRegistration(registration);
  }

  async cancelRegistration(id: ObjectId): Promise<Registration> {
    const registration = await registrationRepository.findById(id).exec();
    await this.userGuard.require(
      'Cancel registration',
      this.userGuard.isAdmin(),
      () => this.userGuard.isCoach(registration.teamId),
      () => this.userGuard.isProgramManager(registration.programId),
      () => this.userGuard.isEventManager(registration.eventId),
    );

    // objednávka jedla sa ruší spolu s registráciou (oprávnenie je už overené vyššie –
    // removeFoodOrder má prísnejšie pravidlá a pre správcu programu by zlyhal)
    const hadFoodOrder = !!registration.foodOrder;
    registration.canceledOn = new Date();
    registration.canceledBy = this.context.user._id;
    registration.foodOrder = null;
    await registration.save();
    if (hadFoodOrder) {
      fireAndForget(
        emailFoodOrderRemoved(registration, this.context.user.username),
        'emailFoodOrderRemoved',
      );
    }

    return RegistrationMapper.toRegistration(registration);
  }

  async changeRegisteredEvent(regId: ObjectId, newEventId: ObjectId): Promise<Registration> {
    await this.userGuard.require('Change registered event', this.userGuard.isAdmin());
    const registration = await registrationRepository.findById(regId).exec();
    const newEvent = await eventRepository.findById(newEventId).exec();
    if (!newEvent) {
      throw new Error('Turnaj nebol nájdený');
    }
    await this.removeFoodOrder(regId);
    registration.eventId = newEventId;
    registration.programId = newEvent.programId;
    await registration.save();

    return RegistrationMapper.toRegistration(registration);
  }

  async getEventRegistrations(eventId: ObjectId): Promise<Registration[]> {
    const regs = await registrationRepository
      .find({ eventId, canceledOn: null })
      .sort({ createdOn: 1 })
      .exec();
    return this.onlyReadable(regs.map(RegistrationMapper.toRegistration));
  }

  async getEventRegistrationsCount(eventId: ObjectId): Promise<number> {
    const count = await registrationRepository.countDocuments({ eventId, canceledOn: null }).exec();
    return count;
  }

  async getProgramRegistrations(
    programId: ObjectId,
    includeNotConfirmed?: boolean | null,
  ): Promise<Registration[]> {
    const q: QueryFilter<RegistrationData> = { programId, canceledOn: null };
    if (includeNotConfirmed === false) {
      q.confirmedOn = { $ne: null };
    }
    const regs = await registrationRepository.find(q).sort({ createdOn: 1 }).exec();
    const mapped = regs.map(RegistrationMapper.toRegistration);
    // správca turnaja v programe potrebuje zoznam registrovaných tímov na pozvánky (turnaj na pozvanie)
    if (await this.userGuard.isEventManagerInProgram(programId)) {
      return mapped;
    }
    return this.onlyReadable(mapped);
  }

  async getProgramRegistrationsCount(programId: ObjectId): Promise<number> {
    const count = await registrationRepository
      .countDocuments({ programId, canceledOn: null })
      .exec();
    return count;
  }

  async setInvoicedOn(
    id: ObjectId,
    invoiceIssuedOn?: Date,
    invoiceRef?: string,
  ): Promise<Registration> {
    await this.userGuard.require('Set invoiced on', this.userGuard.isAdmin());

    const registration = await registrationRepository
      .findByIdAndUpdate(id, { invoiceIssuedOn, invoiceRef }, { returnDocument: 'after' })
      .exec();
    return RegistrationMapper.toRegistration(registration);
  }

  async setFoodInvoicedOn(
    id: ObjectId,
    invoiceIssuedOn?: Date,
    invoiceRef?: string,
  ): Promise<Registration> {
    await this.userGuard.require('Set invoiced on', this.userGuard.isAdmin());

    const q: UpdateQuery<RegistrationData> = {
      foodOrder: {
        invoicedOn: invoiceIssuedOn,
        invoiceRef,
      },
    };
    const registration = await registrationRepository
      .findByIdAndUpdate(id, q, { returnDocument: 'after' })
      .exec();
    return RegistrationMapper.toRegistration(registration);
  }

  async clearInvoicedOn(id: ObjectId): Promise<Registration> {
    await this.userGuard.require('Clear invoiced on', this.userGuard.isAdmin());

    const registration = await registrationRepository
      .findByIdAndUpdate(id, { invoiceIssuedOn: null }, { returnDocument: 'after' })
      .exec();
    return RegistrationMapper.toRegistration(registration);
  }

  async setPaidOn(id: ObjectId, paidOn: Date): Promise<Registration> {
    await this.userGuard.require('Set paid on', this.userGuard.isAdmin());

    const registration = await registrationRepository
      .findByIdAndUpdate(id, { paidOn }, { returnDocument: 'after' })
      .exec();
    return RegistrationMapper.toRegistration(registration);
  }

  async clearPaidOn(id: ObjectId): Promise<Registration> {
    await this.userGuard.require('Clear paid on', this.userGuard.isAdmin());

    const registration = await registrationRepository
      .findByIdAndUpdate(id, { paidOn: null }, { returnDocument: 'after' })
      .exec();
    return RegistrationMapper.toRegistration(registration);
  }

  async setShippedOn(id: ObjectId, shippedOn: Date): Promise<Registration> {
    await this.userGuard.require('Set shipped on', this.userGuard.isAdmin());

    const registration = await registrationRepository
      .findByIdAndUpdate(id, { shippedOn }, { returnDocument: 'after' })
      .exec();
    return RegistrationMapper.toRegistration(registration);
  }

  async clearShippedOn(id: ObjectId): Promise<Registration> {
    await this.userGuard.require('Clear shipped on', this.userGuard.isAdmin());

    const registration = await registrationRepository
      .findByIdAndUpdate(id, { shippedOn: null }, { returnDocument: 'after' })
      .exec();
    return RegistrationMapper.toRegistration(registration);
  }

  async setShipmentGroup(id: ObjectId, shipmentGroup: string): Promise<Registration> {
    await this.userGuard.require('Set shipment group', this.userGuard.isAdmin());

    const registration = await registrationRepository
      .findByIdAndUpdate(id, { shipmentGroup }, { returnDocument: 'after' })
      .exec();
    return RegistrationMapper.toRegistration(registration);
  }

  async setTeamSize(id: ObjectId, input: TeamSizeInput): Promise<Registration> {
    const r = await registrationRepository.findById(id).exec();
    await this.userGuard.require('Set team size', this.userGuard.isAdmin(), () =>
      this.userGuard.isCoach(r.teamId),
    );

    r.girlCount = input.girlCount;
    r.boyCount = input.boyCount;
    r.coachCount = input.coachCount;

    const c = r.girlCount + r.boyCount;
    if (!r.childrenImpacted || r.childrenImpacted < c) {
      r.childrenImpacted = c;
    }
    await r.save();
    return RegistrationMapper.toRegistration(r);
  }

  async setTeamSizeConfirmedOn(id: ObjectId, date: Date): Promise<Registration> {
    const r = await registrationRepository.findById(id).exec();
    await this.userGuard.require('Set team size confirmed on', this.userGuard.isAdmin(), () =>
      this.userGuard.isCoach(r.teamId),
    );
    r.sizeConfirmedOn = date;
    await r.save();

    fireAndForget(
      emailTeamSizeConfirmed(r._id, r.eventId, r.teamId, this.context.user.username),
      'emailTeamSizeConfirmed',
    );

    return RegistrationMapper.toRegistration(r);
  }

  async clearTeamSizeConfirmedOn(id: ObjectId): Promise<Registration> {
    const r = await registrationRepository.findById(id).exec();
    await this.userGuard.require('Clear team size confirmed on', this.userGuard.isAdmin(), () =>
      this.userGuard.isCoach(r.teamId),
    );
    r.sizeConfirmedOn = null;
    await r.save();
    return RegistrationMapper.toRegistration(r);
  }

  async setConfirmedOn(id: ObjectId, confirmedOn: Date): Promise<Registration> {
    await this.userGuard.require('Set confirmed on', this.userGuard.isAdmin());

    let r = await registrationRepository.findById(id).exec();

    let teamNo = 'xxx';
    if (!r.eventId) {
      const tn = await programRepository.incrementTeamRegSequence(r.programId);
      teamNo = formatTeamNo(tn);
    } else {
      // get teamNo from program registration
      const q: Partial<RegistrationData> = {
        programId: r.programId,
        eventId: null,
        teamId: r.teamId,
        canceledOn: null,
      };
      const pr = await registrationRepository.findOne(q).exec();
      if (!pr) {
        throw new Error('Program registration not found');
      }
      teamNo = pr.teamNo;
    }

    const u: Partial<RegistrationData> = {
      confirmedOn,
      teamNo,
    };
    r = await registrationRepository.findByIdAndUpdate(id, u, { returnDocument: 'after' }).exec();

    if (r.eventId) {
      fireAndForget(
        emailEventRegistrationConfirmed(r._id, r.eventId, r.teamId, this.context.user.username),
        'emailEventRegistrationConfirmed',
      );
    } else {
      fireAndForget(
        emailProgramRegistrationConfirmed(r._id, r.programId, r.teamId, this.context.user.username),
        'emailProgramRegistrationConfirmed',
      );
    }
    return RegistrationMapper.toRegistration(r);
  }

  async clearConfirmedOn(id: ObjectId): Promise<Registration> {
    await this.userGuard.require('Clear confirmed on', this.userGuard.isAdmin());

    const registration = await registrationRepository
      .findByIdAndUpdate(id, { confirmedOn: null }, { returnDocument: 'after' })
      .exec();
    return RegistrationMapper.toRegistration(registration);
  }

  async updateFoodOrder(regId: ObjectId, orderData: OrderInput): Promise<RegistrationPayload> {
    const r = await registrationRepository.findById(regId).exec();
    if (!r) {
      throw new Error('Registrácia nenájdená');
    }

    const e = await eventRepository.findById(r.eventId).exec();
    if (!e) {
      throw new Error('Turnaj nenájdený');
    }

    const isEvtMgr = await this.userGuard.isEventManager(e._id);

    if (!e.foodOrderEnabled && !isEvtMgr && !this.userGuard.isAdmin()) {
      // allow admins and event managers to update food orders
      throw new Error('Objednávky jedla nie sú povolené');
    }

    if (r.foodOrder?.invoicedOn && !isEvtMgr && !this.userGuard.isAdmin()) {
      // allow admins and event managers to update food already invoiced orders
      throw new Error('Objednávka jedla už bola fakturovaná. Kontaktujte organizátora.');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    await this.userGuard.require(
      'Update food order',
      this.userGuard.isAdmin(),
      async () =>
        (await this.userGuard.isCoach(r.teamId)) &&
        (e.foodOrderDeadline ? e.foodOrderDeadline.getTime() >= today.getTime() : true),
      isEvtMgr,
    );

    const createdOn = r.foodOrder?.createdOn ?? new Date();
    const no: OrderData = {
      note: orderData.note,
      billTo: orderData.billTo,
      shipTo: orderData.shipTo,
      // cena a názov z cenníka turnaja, nie od klienta (#283); položky s množstvom 0 sa vynechajú
      items: priceFoodOrderItems(orderData.items ?? [], e.foodTypes ?? []),
      createdOn,
      updatedOn: new Date(),
    };

    r.foodOrder = no;
    await r.save();

    fireAndForget(emailFoodOrderUpdated(r, this.context.user.username), 'emailFoodOrderUpdated');

    return { registration: RegistrationMapper.toRegistration(r) };
  }

  async removeFoodOrder(regId: ObjectId): Promise<RegistrationPayload> {
    const r = await registrationRepository.findById(regId).exec();

    if (!r) {
      throw new Error('Registration not found');
    }
    await this.userGuard.require(
      'Remove food order',
      this.userGuard.isAdmin(),
      () => this.userGuard.isEventManager(r.eventId),
      async () => (await this.userGuard.isCoach(r.teamId)) && !r.foodOrder?.invoicedOn,
    );

    if (!r.foodOrder) {
      // nie je čo odstrániť – bez zmeny a bez e-mailu
      return { registration: RegistrationMapper.toRegistration(r) };
    }

    r.foodOrder = null;
    await r.save();

    fireAndForget(emailFoodOrderRemoved(r, this.context.user.username), 'emailFoodOrderRemoved');

    return { registration: RegistrationMapper.toRegistration(r) };
  }

  async getRegisteredTeams(
    eventId: ObjectId,
    includeCoaches?: boolean,
  ): Promise<RegisteredTeamPayload[]> {
    const regs = await registrationRepository.find({ eventId, canceledOn: null }).exec();
    // zoznam tímov na turnaji vidí každý prihlásený; adresu, platbu a objednávku jedla
    // iba admin, správca turnaja/programu a tréner daného tímu (#289)
    const isManager =
      this.userGuard.isAdmin() ||
      (await this.userGuard.isEventManager(eventId)) ||
      (await this.userGuard.isProgramManagerForEvent(eventId));
    const teams: RegisteredTeamPayload[] = [];
    for (const reg of regs) {
      const team = await teamRepository.findById(reg.teamId).exec();
      if (!team) {
        continue;
      }
      const showDetails = isManager || (await this.userGuard.isCoach(reg.teamId));
      const t: RegisteredTeamPayload = {
        id: reg._id,
        teamId: team._id,
        teamNo: reg.teamNo,
        registeredOn: reg.createdOn,
        confirmedOn: reg.confirmedOn,
        paidOn: reg.paidOn,
        name: team.name,
        coachCount: reg.coachCount ?? 0,
        boyCount: reg.boyCount ?? 0,
        girlCount: reg.girlCount ?? 0,
        sizeConfirmedOn: reg.sizeConfirmedOn,
        type: reg.type,
        impactedChildrenCount: reg.childrenImpacted ?? 0,
        impactedTeamCount: reg.teamsImpacted ?? 1,
        setCount: reg.setCount ?? 1,
        address: {
          id: team.address._id,
          name: team.address.name,
          street: team.address.street,
          city: team.address.city,
          zip: team.address.zip,
          companyNumber: team.address.companyNumber,
          vatNumber: team.address.vatNumber,
          taxNumber: team.address.taxNumber,
        },
        coaches: [],
        foodOrder: OrderMapper.toOrder(reg.foodOrder),
      };
      if (!showDetails) {
        t.paidOn = null;
        t.foodOrder = null;
        t.address = {
          id: team.address?._id,
          name: team.address?.name ?? '',
          city: team.address?.city ?? '',
          street: '',
          zip: '',
        };
      }

      if (includeCoaches && isManager) {
        const c = await userRepository
          .find({ _id: { $in: team.coachesIds }, deletedOn: null }, { _id: 1 })
          .sort({ username: 1 })
          .exec();
        const cp = c.map((u) => this.context.dataSources.user.getUser(u._id));
        t.coaches = await Promise.all(cp);
      }
      teams.push(t);
    }
    teams.sort((a, b) => a.name.localeCompare(b.name, 'sk', { sensitivity: 'base' }));
    return teams;
  }
}
