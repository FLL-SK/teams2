import { DataSourceConfig } from 'apollo-datasource';

import { ApolloContext } from '../graphql/apollo-context';

import { BaseDataSource } from './_base.datasource';
import { eventRepository, TeamData, teamRepository, userRepository } from '../models';
import {
  CreateTeamInput,
  CreateTeamPayload,
  Team,
  UpdateTeamInput,
  UpdateTeamPayload,
  User,
  Event,
} from '../generated/graphql';
import { EventMapper, TeamMapper, UserMapper } from '../graphql/mappers';
import { ObjectId } from 'mongodb';

export class TeamDataSource extends BaseDataSource {
  constructor() {
    super();
  }

  initialize(config: DataSourceConfig<ApolloContext>) {
    super.initialize(config);
  }

  async getTeam(id: ObjectId): Promise<Team> {
    return TeamMapper.toTeam(await teamRepository.findById(id));
  }

  async getTeams(): Promise<Team[]> {
    const teams = await teamRepository.find();
    return teams.map((t) => TeamMapper.toTeam(t));
  }

  async createTeam(input: CreateTeamInput): Promise<CreateTeamPayload> {
    console.log('user', this.context.user);
    const currentUserId = this.context.user._id;

    const t: TeamData = { ...input, coachesIds: [currentUserId] };
    console.log('creating team', t);
    const nu = await teamRepository.create(t);
    return { team: TeamMapper.toTeam(nu) };
  }

  async updateTeam(id: ObjectId, input: UpdateTeamInput): Promise<UpdateTeamPayload> {
    const u = await teamRepository.findByIdAndUpdate(id, input).exec();
    return { team: TeamMapper.toTeam(u) };
  }

  async deleteTeam(id: ObjectId): Promise<Team> {
    const u = await teamRepository.findByIdAndDelete(id).exec();
    return TeamMapper.toTeam(u);
  }

  async getTeamsCoachedBy(coachId: ObjectId): Promise<Team[]> {
    const teams = await teamRepository.findTeamsCoachedByUser(coachId);
    return teams.map((t) => TeamMapper.toTeam(t));
  }

  async addCoachToTeam(teamId: ObjectId, coachId: ObjectId): Promise<Team> {
    const t = await teamRepository.findByIdAndUpdate(
      teamId,
      { $addToSet: { coachesIds: coachId } },
      { new: true }
    );
    return TeamMapper.toTeam(t);
  }

  async removeCoachFromTeam(teamId: ObjectId, coachId: ObjectId): Promise<Team> {
    const t = await teamRepository.findByIdAndUpdate(
      teamId,
      { $pull: { coachesIds: coachId } },
      { new: true }
    );
    return TeamMapper.toTeam(t);
  }

  async getTeamCoaches(teamId: ObjectId): Promise<User[]> {
    const t = await teamRepository.findById(teamId);
    if (!t) {
      throw new Error('Team not found');
    }
    const coaches = await Promise.all(t.coachesIds.map(async (c) => userRepository.findById(c)));
    return coaches.map((c) => UserMapper.toUser(c));
  }

  async getTeamEvents(teamId: ObjectId): Promise<Event[]> {
    const events = await eventRepository.find({ teamsIds: teamId });
    return events.map((c) => EventMapper.toEvent(c));
  }
}
