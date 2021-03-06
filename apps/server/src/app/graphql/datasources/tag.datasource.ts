import { DataSourceConfig } from 'apollo-datasource';
import { ApolloContext } from '../apollo-context';
import { BaseDataSource } from './_base.datasource';
import { TagData, tagRepository } from '../../models';
import { Tag, TagInput } from '../../generated/graphql';
import { TagMapper } from '../mappers';
import { ObjectId } from 'mongodb';

import { logger } from '@teams2/logger';
import { FilterQuery } from 'mongoose';
import * as Dataloader from 'dataloader';

export class TagDataSource extends BaseDataSource {
  private loader: Dataloader<string, Tag, string>;

  constructor() {
    super();
    this.logBase = logger('DS:tag');
  }

  initialize(config: DataSourceConfig<ApolloContext>) {
    super.initialize(config);
    this.loader = new Dataloader(this.loaderFn.bind(this));
  }

  private async loaderFn(ids: string[]): Promise<Tag[]> {
    const oids = ids.map((id) => new ObjectId(id));
    const rec = await tagRepository.find({ _id: { $in: ids } }).exec();
    const data = oids.map((id) => rec.find((e) => e._id.equals(id)) || null);
    return data.map(TagMapper.toTag.bind(this));
  }

  async getTag(id: ObjectId): Promise<Tag> {
    this.userGuard.isAdmin() || this.userGuard.notAuthorized();
    const tag = this.loader.load(id.toString());
    return tag;
  }

  async getTags(includeDeleted = false): Promise<Tag[]> {
    const log = this.logBase.extend('getTags');
    log.debug('start', this.userGuard.isAdmin());
    if (!this.userGuard.isAdmin()) {
      return [];
    }
    const q: FilterQuery<TagData> = {};
    if (!includeDeleted) {
      q.deletedOn = null;
    }
    const tags = await tagRepository.find(q).sort({ label: 1 }).exec();
    return tags.map(TagMapper.toTag);
  }

  async createTag(input: TagInput): Promise<Tag> {
    this.userGuard.isAdmin() || this.userGuard.notAuthorized();

    const t: TagData = { color: 'TC1', ...input };
    const tag = await tagRepository.create(t);
    return TagMapper.toTag(tag);
  }

  async updateTag(id: ObjectId, input: TagInput): Promise<Tag> {
    this.userGuard.isAdmin() || this.userGuard.notAuthorized();

    const tag = await tagRepository.findByIdAndUpdate(id, input, { new: true }).exec();
    return TagMapper.toTag(tag);
  }

  async deleteTag(id: ObjectId): Promise<Tag> {
    this.userGuard.isAdmin() || this.userGuard.notAuthorized();

    const tag = await tagRepository
      .findByIdAndUpdate(id, { deletedOn: new Date() }, { new: true })
      .exec();
    return TagMapper.toTag(tag);
  }
}
