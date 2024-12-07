import { PricelistItem } from '../../_generated/graphql';
import { PricelistEntryData } from '../../models';

export const PricelistEntryMapper = {
  toPricelistEntry(entry: PricelistEntryData | null | undefined): PricelistItem | null {
    if (!entry) {
      return null;
    }
    const u: Omit<Required<PricelistItem>, '__typename'> = {
      id: entry._id,
      n: entry.n,
      u: entry.u,
      up: entry.up,
    };
    return u;
  },
};
