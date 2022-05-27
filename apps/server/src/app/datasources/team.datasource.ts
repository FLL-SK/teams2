import { DataSourceConfig } from 'apollo-datasource';

import { ApolloContext } from '../graphql/apollo-context';

import { BaseDataSource } from './_base.datasource';
import { TeamData, teamRepository } from '../models';
import {
  CreateTeamInput,
  CreateTeamPayload,
  Team,
  UpdateTeamInput,
  UpdateTeamPayload,
} from '../generated/graphql';
import { TeamMapper } from '../graphql/mappers';
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
    const currentUserId = this.context.user._id;
    const t: TeamData = { ...input, coachesIds: [currentUserId] };
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
}
