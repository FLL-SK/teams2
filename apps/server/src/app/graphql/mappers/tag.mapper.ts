import { Tag } from '../../generated/graphql';
import { TagData } from '../../models';

export const TagMapper = {
  toTag(tag: TagData | null | undefined): Tag | null {
    if (!tag) {
      return null;
    }
    const u: Omit<Required<Tag>, '__typename'> = {
      id: tag._id,
      label: tag.label,
      color: tag.color,
      deletedOn: tag.deletedOn,
      deletedBy: tag.deletedBy,
    };
    return u;
  },
};
