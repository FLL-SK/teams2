import { BaseDataSource } from './_base.datasource';
import { TagData, tagRepository } from '../../models';
import { Tag, TagInput } from '../../_generated/graphql';
import { TagMapper } from '../mappers';
import { ObjectId } from 'mongodb';

import { logger } from '@teams2/logger';
import { QueryFilter } from 'mongoose';
import Dataloader from 'dataloader';

const logBase = logger('DS:Tag');

export class TagDataSource extends BaseDataSource {
  declare private loader: Dataloader<string, Tag, string>;

  protected override _initialize() {
    this.loader = new Dataloader(this.loaderFn.bind(this));
  }

  private async loaderFn(ids: string[]): Promise<Tag[]> {
    const oids = ids.map((id) => new ObjectId(id));
    const rec = await tagRepository.find({ _id: { $in: ids } }).exec();
    const data = oids.map((id) => rec.find((e) => e._id.equals(id)) ?? null);
    return data.map(TagMapper.toTag.bind(this));
  }

  async getTag(id: ObjectId): Promise<Tag> {
    if (!id) return null;
    const log = logBase.extend('getTag');
    await this.userGuard.require('Get tag', this.userGuard.isAdmin());
    const tag = await this.loader.load(id.toString());
    if (!tag) {
      log.warn('getTag %s not found', id.toString());
    }
    return tag;
  }

  async getTags(includeDeleted = false): Promise<Tag[]> {
    const log = logBase.extend('getTags');
    log.debug('start', this.userGuard.isAdmin());
    if (!this.userGuard.isAdmin()) {
      return [];
    }
    const q: QueryFilter<TagData> = {};
    if (!includeDeleted) {
      q.deletedOn = null;
    }
    const tags = await tagRepository.find(q).sort({ label: 1 }).exec();
    return tags.map(TagMapper.toTag);
  }

  async createTag(input: TagInput): Promise<Tag> {
    await this.userGuard.require('Create tag', this.userGuard.isAdmin());

    const t: TagData = { color: 'TC1', ...input };
    const tag = await tagRepository.create(t);
    return TagMapper.toTag(tag);
  }

  async updateTag(id: ObjectId, input: TagInput): Promise<Tag> {
    await this.userGuard.require('Update tag', this.userGuard.isAdmin());

    const tag = await tagRepository
      .findByIdAndUpdate(id, input, { returnDocument: 'after' })
      .exec();
    return TagMapper.toTag(tag);
  }

  async deleteTag(id: ObjectId): Promise<Tag> {
    await this.userGuard.require('Delete tag', this.userGuard.isAdmin());
    const log = logBase.extend('deleteTag');
    log.debug('start', id);
    const tag = await tagRepository
      .findByIdAndUpdate(
        id,
        { deletedOn: new Date(), deletedBy: this.context.user._id },
        { returnDocument: 'after' },
      )
      .exec();
    return TagMapper.toTag(tag);
  }

  async restoreTag(id: ObjectId): Promise<Tag> {
    await this.userGuard.require('Restore tag', this.userGuard.isAdmin());
    const log = logBase.extend('restoreTag');
    log.debug('start', id);
    const tag = await tagRepository
      .findByIdAndUpdate(id, { deletedOn: null, deletedBy: null }, { returnDocument: 'after' })
      .exec();
    return TagMapper.toTag(tag);
  }
}
