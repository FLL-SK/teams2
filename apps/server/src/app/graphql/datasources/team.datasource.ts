import { DataSourceConfig } from 'apollo-datasource';
import { ApolloContext } from '../apollo-context';
import { BaseDataSource } from './_base.datasource';
import { registrationRepository, TeamData, teamRepository, userRepository } from '../../models';
import {
  CreateTeamInput,
  TeamPayload,
  Team,
  UpdateTeamInput,
  User,
  Registration,
  Tag,
  TeamFilterInput,
} from '../../generated/graphql';
import { RegistrationMapper, TeamMapper } from '../mappers';
import { ObjectId } from 'mongodb';
import * as Dataloader from 'dataloader';
import { FilterQuery, UpdateQuery } from 'mongoose';
import { logger } from '@teams2/logger';

export class TeamDataSource extends BaseDataSource {
  private loader: Dataloader<string, Team, string>;

  constructor() {
    super();
    this.logBase = logger('DS:team');
  }

  initialize(config: DataSourceConfig<ApolloContext>) {
    super.initialize(config);
    this.loader = new Dataloader(this.loaderFn.bind(this));
  }

  private async loaderFn(ids: string[]): Promise<Team[]> {
    const oids = ids.map((id) => new ObjectId(id));
    const rec = await teamRepository.find({ _id: { $in: oids } }).exec();
    const data = oids.map((id) => rec.find((e) => e._id.equals(id)) ?? null);
    return data.map(TeamMapper.toTeam.bind(this));
  }

  async getTeam(id: ObjectId): Promise<Team> {
    if (!id) return null;
    const log = this.logBase.extend('getTeam');
    log.debug('getTeam %s', id.toString());
    const team = this.loader.load(id.toString());
    return team;
  }

  async getTeams(filter: TeamFilterInput): Promise<Team[]> {
    const q: FilterQuery<TeamData> = {};
    if (!filter.includeInactive) {
      q.deletedOn = null;
    }
    if (filter.hasTags) {
      q.tagIds = { $all: filter.hasTags };
    }

    const teams = await teamRepository.find(q).sort({ name: 1 }).exec();
    return teams.map((t) => TeamMapper.toTeam(t));
  }

  async createTeam(input: CreateTeamInput): Promise<TeamPayload> {
    const log = this.logBase.extend('create');
    const currentUserId = this.context.user._id;

    const t: TeamData = {
      name: input.name,
      tagIds: [],
      address: {
        name: input.orgName,
        street: input.street,
        city: input.city,
        zip: input.zip,
        countryCode: input.countryCode,
        contactName: input.contactName,
        email: input.email,
        phone: input.phone,
      },
      coachesIds: [currentUserId],
      createdOn: new Date(),
    };
    log.debug('creating team %o', t);
    const nu = await teamRepository.create(t);
    log.info('Created team %s %s', nu.name, nu._id.toString());
    return { team: TeamMapper.toTeam(nu) };
  }

  async updateTeam(id: ObjectId, input: UpdateTeamInput): Promise<TeamPayload> {
    this.userGuard.isAdmin() ||
      (await this.userGuard.isCoach(id)) ||
      this.userGuard.notAuthorized('Update team');

    const u = await teamRepository.findByIdAndUpdate(id, input, { new: true }).exec();
    return { team: TeamMapper.toTeam(u) };
  }

  async deleteTeam(id: ObjectId): Promise<Team> {
    this.userGuard.isAdmin() ||
      (await this.userGuard.isCoach(id)) ||
      this.userGuard.notAuthorized('Delete team');

    const u = await teamRepository
      .findByIdAndUpdate(
        id,
        { deletedOn: new Date(), deletedBy: this.context.user._id },
        { new: true }
      )
      .exec();
    return TeamMapper.toTeam(u);
  }

  async undeleteTeam(id: ObjectId): Promise<Team> {
    this.userGuard.isAdmin() ||
      (await this.userGuard.isCoach(id)) ||
      this.userGuard.notAuthorized('Undelete team');

    const u = await teamRepository
      .findByIdAndUpdate(id, { $unset: { deletedOn: null, deletedBy: null } }, { new: true })
      .exec();
    return TeamMapper.toTeam(u);
  }

  async getTeamsCoachedBy(coachId: ObjectId): Promise<Team[]> {
    this.userGuard.isAdmin() ||
      this.userGuard.isSelf(coachId) ||
      this.userGuard.notAuthorized('Get teams coached by');

    const log = this.logBase.extend('getCoachedBy');
    const teams = await teamRepository.findTeamsCoachedByUser(coachId);
    log.debug('getCoachedBy %s %d', coachId.toString(), teams.length);
    return teams.filter((t) => !!t).map((t) => TeamMapper.toTeam(t));
  }

  async addCoachToTeam(teamId: ObjectId, username: string): Promise<Team> {
    this.userGuard.isAdmin() ||
      (await this.userGuard.isCoach(teamId)) ||
      this.userGuard.notAuthorized('Add coach to team');

    const u = await userRepository.findActiveByUsername(username);
    if (!u) {
      throw new Error('User not found');
    }
    const t = await teamRepository.findByIdAndUpdate(
      { _id: teamId },
      { $addToSet: { coachesIds: u._id } },
      { new: true }
    );
    return TeamMapper.toTeam(t);
  }

  async removeCoachFromTeam(teamId: ObjectId, coachId: ObjectId): Promise<Team> {
    this.userGuard.isAdmin() ||
      (await this.userGuard.isCoach(teamId)) ||
      this.userGuard.notAuthorized('Remove coach from team');

    const t = await teamRepository.findByIdAndUpdate(
      { _id: teamId },
      { $pull: { coachesIds: coachId } },
      { new: true }
    );
    return TeamMapper.toTeam(t);
  }

  async getTeamCoaches(teamId: ObjectId): Promise<User[]> {
    const log = this.logBase.extend('getTeamCoaches');
    const isAdmin = this.userGuard.isAdmin();
    const isCoach = await this.userGuard.isCoach(teamId);
    const isEvtMgr = await this.isTeamRegisteredOnEventManagedBy(this.context.user._id, teamId);
    log.debug(
      'team %s isAdmin=%s isCoach=%s isEvtMgr=%s',
      teamId.toString(),
      isAdmin,
      isCoach,
      isEvtMgr
    );
    if (!(isAdmin || isCoach || isEvtMgr)) {
      return [];
    }

    const t = await this.getTeam(teamId);
    if (!t) {
      throw new Error('Team not found');
    }
    if (!t.coachesIds || t.coachesIds.length === 0) {
      return [];
    }
    const coaches = await Promise.all(
      t.coachesIds.map((c) => this.context.dataSources.user.getUser(c))
    );
    return coaches.filter((c) => !!c);
  }

  async getTeamRegistrations(teamId: ObjectId): Promise<Registration[]> {
    if (!this.userGuard.isAdmin() && !(await this.userGuard.isCoach(teamId))) {
      return [];
    }

    const events = await registrationRepository.find({ teamId }).exec();
    return events.map((c) => RegistrationMapper.toRegistration(c));
  }

  async addTagToTeam(teamId: ObjectId, tagId: ObjectId): Promise<Team> {
    this.userGuard.isAdmin() || this.userGuard.notAuthorized('Add tag to team');

    const t = await teamRepository.findByIdAndUpdate(
      { _id: teamId },
      { $addToSet: { tagIds: tagId } },
      { new: true }
    );
    return TeamMapper.toTeam(t);
  }

  async removeTagFromTeam(teamId: ObjectId, tagId: ObjectId): Promise<Team> {
    this.userGuard.isAdmin() || this.userGuard.notAuthorized('Remove tag from team');

    const t = await teamRepository.findByIdAndUpdate(
      { _id: teamId },
      { $pull: { tagIds: tagId } },
      { new: true }
    );
    return TeamMapper.toTeam(t);
  }

  async getTeamTags(teamId: ObjectId): Promise<Tag[]> {
    const log = this.logBase.extend('getTeamTags');
    log.debug('start', this.userGuard.isAdmin());
    if (!this.userGuard.isAdmin()) {
      return [];
    }
    const t = await this.getTeam(teamId);
    if (!t) {
      throw new Error('Team not found');
    }
    if (!t.tagIds || t.tagIds.length === 0) {
      return [];
    }

    const tags = await Promise.all(t.tagIds.map((c) => this.context.dataSources.tag.getTag(c)));

    return tags.filter((c) => !!c && !c.deletedOn); // this filter should remove nulls caused by data incosistency
  }

  async recalculateTeamStats(): Promise<number> {
    this.userGuard.isAdmin() || this.userGuard.notAuthorized('Recalculate team stats');
    const teams = await teamRepository.find({ createdOn: null }).exec();
    for (const t of teams) {
      const tu: UpdateQuery<TeamData> = {};
      const r = await registrationRepository.find({ teamId: t._id }).sort({ createdOn: -1 }).exec();
      if (r.length > 0) {
        tu.lastRegOn = r[0].createdOn;
      }
      await teamRepository.updateOne({ _id: t._id }, tu).exec();
    }

    return teams.length;
  }

  async isTeamRegisteredOnEventManagedBy(userId: ObjectId, teamId: ObjectId): Promise<boolean> {
    const reg = await registrationRepository
      .findOne({ teamId, eventId: this.context.userGuard.getManagedEvents() })
      .lean()
      .exec();

    return reg !== null;
  }
}
