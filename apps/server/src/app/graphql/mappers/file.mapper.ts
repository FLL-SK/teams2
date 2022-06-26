import { FileData } from '../../models';
import { File } from '../../generated/graphql';

export const FileMapper = {
  toFile(file: FileData | null | undefined): File | null {
    if (!file) {
      return null;
    }
    const u: Omit<Required<File>, '__typename'> = {
      id: file._id,
      name: file.name,
      size: file.size,
      type: file.type,
      updatedOn: file.updatedOn,
      programId: file.programId,
      eventId: file.eventId,
      teamId: file.teamId,

      url: null,
    };
    return u;
  },
};
