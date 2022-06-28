import { DataSourceConfig } from 'apollo-datasource';
import { ApolloContext } from '../apollo-context';
import { BaseDataSource } from './_base.datasource';
import { eventTeamRepository, TeamData, teamRepository, userRepository } from '../../models';
import {
  CreateTeamInput,
  CreateTeamPayload,
  Team,
  UpdateTeamInput,
  UpdateTeamPayload,
  User,
  EventTeam,
} from '../../generated/graphql';
import { EventTeamMapper, TeamMapper, UserMapper } from '../mappers';
import { ObjectId } from 'mongodb';
import * as Dataloader from 'dataloader';

export class TeamDataSource extends BaseDataSource {
  private loader: Dataloader<string, Team, string>;

  constructor() {
    super();
  }

  initialize(config: DataSourceConfig<ApolloContext>) {
    super.initialize(config);
    this.loader = new Dataloader(this.loaderFn.bind(this));
  }

  private async loaderFn(ids: string[]): Promise<Team[]> {
    const data = await teamRepository.find({ _id: { $in: ids } }).exec();
    return data.map(TeamMapper.toTeam.bind(this));
  }

  async getTeam(id: ObjectId): Promise<Team> {
    //const team = TeamMapper.toTeam(await teamRepository.findById(id).exec());
    const team = this.loader.load(id.toString());

    return team;
  }

  async getTeams(): Promise<Team[]> {
    const teams = await teamRepository.find().sort({ name: 1 }).exec();
    return teams.map((t) => TeamMapper.toTeam(t));
  }

  async createTeam(input: CreateTeamInput): Promise<CreateTeamPayload> {
    const currentUserId = this.context.user._id;

    const t: TeamData = {
      name: input.name,
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
    const nu = await teamRepository.create(t);
    return { team: TeamMapper.toTeam(nu) };
  }

  async updateTeam(id: ObjectId, input: UpdateTeamInput): Promise<UpdateTeamPayload> {
    const u = await teamRepository.findByIdAndUpdate(id, input, { new: true }).exec();
    return { team: TeamMapper.toTeam(u) };
  }

  async deleteTeam(id: ObjectId): Promise<Team> {
    const u = await teamRepository.findByIdAndDelete(id).exec();
    return TeamMapper.toTeam(u);
  }

  async getTeamsCoachedBy(coachId: ObjectId): Promise<Team[]> {
    const teams = await teamRepository.findTeamsCoachedByUser(coachId);
    return teams.filter((t) => !!t).map((t) => TeamMapper.toTeam(t));
  }

  async addCoachToTeam(teamId: ObjectId, coachId: ObjectId): Promise<Team> {
    const t = await teamRepository.findByIdAndUpdate(
      { _id: teamId },
      { $addToSet: { coachesIds: coachId } },
      { new: true }
    );
    return TeamMapper.toTeam(t);
  }

  async removeCoachFromTeam(teamId: ObjectId, coachId: ObjectId): Promise<Team> {
    const t = await teamRepository.findByIdAndUpdate(
      { _id: teamId },
      { $pull: { coachesIds: coachId } },
      { new: true }
    );
    return TeamMapper.toTeam(t);
  }

  async getTeamCoaches(teamId: ObjectId): Promise<User[]> {
    const t = await teamRepository.findById(teamId).lean().exec();
    if (!t) {
      throw new Error('Team not found');
    }
    const coaches = await Promise.all(
      t.coachesIds.map(async (c) => userRepository.findById(c).lean().exec())
    );
    return coaches.filter((c) => !!c).map((c) => UserMapper.toUser(c));
  }

  async getTeamEvents(teamId: ObjectId): Promise<EventTeam[]> {
    const events = await eventTeamRepository.find({ teamId: teamId }).exec();
    return events.map((c) => EventTeamMapper.toEventTeam(c));
  }
}
