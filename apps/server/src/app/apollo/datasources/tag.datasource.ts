import { BaseDataSource } from './_base.datasource';
import { TagData, tagRepository } from '../../models';
import { Tag, TagInput } from '../../_generated/graphql';
import { TagMapper } from '../mappers';
import { ObjectId } from 'mongodb';

import { logger } from '@teams2/logger';
import { FilterQuery } from 'mongoose';
import Dataloader from 'dataloader';

const logBase = logger('DS:Tag');

export class TagDataSource extends BaseDataSource {
  private loader: Dataloader<string, Tag, string>;

  protected _initialize() {
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
    this.userGuard.isAdmin() || this.userGuard.notAuthorized('Get tag');
    const tag = this.loader.load(id.toString());
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
    const q: FilterQuery<TagData> = {};
    if (!includeDeleted) {
      q.deletedOn = null;
    }
    const tags = await tagRepository.find(q).sort({ label: 1 }).exec();
    return tags.map(TagMapper.toTag);
  }

  async createTag(input: TagInput): Promise<Tag> {
    this.userGuard.isAdmin() || this.userGuard.notAuthorized('Create tag');

    const t: TagData = { color: 'TC1', ...input };
    const tag = await tagRepository.create(t);
    return TagMapper.toTag(tag);
  }

  async updateTag(id: ObjectId, input: TagInput): Promise<Tag> {
    this.userGuard.isAdmin() || this.userGuard.notAuthorized('Update tag');

    const tag = await tagRepository.findByIdAndUpdate(id, input, { new: true }).exec();
    return TagMapper.toTag(tag);
  }

  async deleteTag(id: ObjectId): Promise<Tag> {
    this.userGuard.isAdmin() || this.userGuard.notAuthorized('Delete tag');
    const log = logBase.extend('deleteTag');
    log.debug('start', id);
    const tag = await tagRepository
      .findByIdAndUpdate(
        id,
        { deletedOn: new Date(), deletedBy: this.context.user._id },
        { new: true },
      )
      .exec();
    return TagMapper.toTag(tag);
  }

  async restoreTag(id: ObjectId): Promise<Tag> {
    this.userGuard.isAdmin() || this.userGuard.notAuthorized('Restore tag');
    const log = logBase.extend('restoreTag');
    log.debug('start', id);
    const tag = await tagRepository
      .findByIdAndUpdate(id, { deletedOn: null, deletedBy: null }, { new: true })
      .exec();
    return TagMapper.toTag(tag);
  }
}
