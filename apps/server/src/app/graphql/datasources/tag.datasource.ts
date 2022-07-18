import { DataSourceConfig } from 'apollo-datasource';
import { ApolloContext } from '../apollo-context';
import { BaseDataSource } from './_base.datasource';
import { TagData, tagRepository } from '../../models';
import { Tag, TagInput } from '../../generated/graphql';
import { TagMapper } from '../mappers';
import { ObjectId } from 'mongodb';

import { logger } from '@teams2/logger';
import { FilterQuery } from 'mongoose';

export class TagDataSource extends BaseDataSource {
  constructor() {
    super();
    this.logBase = logger('DS:Tag');
  }

  initialize(config: DataSourceConfig<ApolloContext>) {
    super.initialize(config);
  }

  async getTags(includeDeleted = false): Promise<Tag[]> {
    const q: FilterQuery<TagData> = {};
    if (!includeDeleted) {
      q.deletedOn = null;
    }
    const tags = await tagRepository.find(q).sort({ label: 1 }).exec();
    return tags.map(TagMapper.toTag);
  }

  async createTag(input: TagInput): Promise<Tag> {
    const tag = await tagRepository.create(input);
    return TagMapper.toTag(tag);
  }

  async updateTag(id: ObjectId, input: TagInput): Promise<Tag> {
    const tag = await tagRepository.findByIdAndUpdate(id, input, { new: true }).exec();
    return TagMapper.toTag(tag);
  }

  async deleteTag(id: ObjectId): Promise<Tag> {
    const tag = await tagRepository
      .findByIdAndUpdate(id, { deletedOn: new Date() }, { new: true })
      .exec();
    return TagMapper.toTag(tag);
  }
}
