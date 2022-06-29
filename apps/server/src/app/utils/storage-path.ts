import { FileType } from '../generated/graphql';

export function storagePath(name: string, type: FileType, ref?: string): string {
  return `${type}/${ref}/${name}`;
}
