import { FileData } from '../../models';
import { File } from '../../generated/graphql';

export const FileMapper = {
  toFile(file: FileData | null | undefined): File | null {
    if (!file) {
      return null;
    }
    const u: Omit<Required<File>, '__typename'> = {
      id: file._id,
      type: file.type,
      name: file.name,
      size: file.size,
      contentType: file.contentType,
      updatedOn: file.updatedOn,
      storagePath: file.storagePath,

      url: null,
    };
    return u;
  },
};
