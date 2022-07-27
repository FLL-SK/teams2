import { DataSourceConfig } from 'apollo-datasource';
import { ApolloContext } from '../apollo-context';
import { BaseDataSource } from './_base.datasource';
import {
  registrationRepository,
  tagRepository,
  TeamData,
  teamRepository,
  userRepository,
} from '../../models';
import {
  CreateTeamInput,
  CreateTeamPayload,
  Team,
  UpdateTeamInput,
  UpdateTeamPayload,
  User,
  Registration,
  Tag,
  TeamFilterInput,
} from '../../generated/graphql';
import { RegistrationMapper, TagMapper, TeamMapper, UserMapper } from '../mappers';
import { ObjectId } from 'mongodb';
import * as Dataloader from 'dataloader';
import { FilterQuery } from 'mongoose';
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
    const data = oids.map((id) => rec.find((e) => e._id.equals(id)) || null);
    return data.map(TeamMapper.toTeam.bind(this));
  }

  async getTeam(id: ObjectId): Promise<Team> {
    const log = this.logBase.extend('getTeam');
    log.debug('getTeam %s', id.toString());
    const team = this.loader.load(id.toString());
    return team;
  }

  async getTeams(filter: TeamFilterInput): Promise<Team[]> {
    const q: FilterQuery<TeamData> = {};
    if (filter.isActive) {
      q.deletedOn = null;
    }
    if (filter.hasTags) {
      q.tagIds = { $all: filter.hasTags };
    }

    const teams = await teamRepository.find(q).sort({ name: 1 }).exec();
    return teams.map((t) => TeamMapper.toTeam(t));
  }

  async createTeam(input: CreateTeamInput): Promise<CreateTeamPayload> {
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
    };
    log.debug('creating team %o', t);
    const nu = await teamRepository.create(t);
    log.info('Created team %s %s', nu.name, nu._id.toString());
    return { team: TeamMapper.toTeam(nu) };
  }

  async updateTeam(id: ObjectId, input: UpdateTeamInput): Promise<UpdateTeamPayload> {
    this.userGuard.isAdmin() ||
      (await this.userGuard.isCoach(id)) ||
      this.userGuard.notAuthorized();

    const u = await teamRepository.findByIdAndUpdate(id, input, { new: true }).exec();
    return { team: TeamMapper.toTeam(u) };
  }

  async deleteTeam(id: ObjectId): Promise<Team> {
    this.userGuard.isAdmin() ||
      (await this.userGuard.isCoach(id)) ||
      this.userGuard.notAuthorized();

    const u = await teamRepository.findByIdAndDelete(id).exec();
    return TeamMapper.toTeam(u);
  }

  async getTeamsCoachedBy(coachId: ObjectId): Promise<Team[]> {
    this.userGuard.isAdmin() || this.userGuard.isSelf(coachId) || this.userGuard.notAuthorized();

    const log = this.logBase.extend('getCoachedBy');
    const teams = await teamRepository.findTeamsCoachedByUser(coachId);
    log.debug('getCoachedBy %s %d', coachId.toString(), teams.length);
    return teams.filter((t) => !!t).map((t) => TeamMapper.toTeam(t));
  }

  async addCoachToTeam(teamId: ObjectId, username: string): Promise<Team> {
    this.userGuard.isAdmin() ||
      (await this.userGuard.isCoach(teamId)) ||
      this.userGuard.notAuthorized();

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
      this.userGuard.notAuthorized();

    const t = await teamRepository.findByIdAndUpdate(
      { _id: teamId },
      { $pull: { coachesIds: coachId } },
      { new: true }
    );
    return TeamMapper.toTeam(t);
  }

  async getTeamCoaches(teamId: ObjectId): Promise<User[]> {
    const log = this.logBase.extend('getTeamCoaches');
    log.debug(
      'team %s isAdmin=%s isCoach=%s',
      teamId.toString(),
      this.userGuard.isAdmin(),
      await this.userGuard.isCoach(teamId)
    );
    if (!this.userGuard.isAdmin() && !(await this.userGuard.isCoach(teamId))) {
      return [];
    }

    const t = await teamRepository.findById(teamId).lean().exec();
    if (!t) {
      throw new Error('Team not found');
    }
    if (!t.coachesIds || t.coachesIds.length === 0) {
      return [];
    }
    const coaches = await Promise.all(
      t.coachesIds.map(async (c) => userRepository.findById(c).lean().exec())
    );
    return coaches.filter((c) => !!c).map((c) => UserMapper.toUser(c));
  }

  async getTeamRegistrations(teamId: ObjectId): Promise<Registration[]> {
    if (!this.userGuard.isAdmin() && !(await this.userGuard.isCoach(teamId))) {
      return [];
    }

    const events = await registrationRepository.find({ teamId }).exec();
    return events.map((c) => RegistrationMapper.toRegistration(c));
  }

  async addTagToTeam(teamId: ObjectId, tagId: ObjectId): Promise<Team> {
    this.userGuard.isAdmin() || this.userGuard.notAuthorized();

    const t = await teamRepository.findByIdAndUpdate(
      { _id: teamId },
      { $addToSet: { tagIds: tagId } },
      { new: true }
    );
    return TeamMapper.toTeam(t);
  }

  async removeTagFromTeam(teamId: ObjectId, tagId: ObjectId): Promise<Team> {
    this.userGuard.isAdmin() || this.userGuard.notAuthorized();

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
    const t = await teamRepository.findById(teamId).lean().exec();
    if (!t) {
      throw new Error('Team not found');
    }
    if (!t.tagIds || t.tagIds.length === 0) {
      return [];
    }

    const tags = await Promise.all(
      t.tagIds.map(async (c) => tagRepository.findById(c).lean().exec())
    );

    return tags.filter((c) => !!c).map((c) => TagMapper.toTag(c));
  }
}
