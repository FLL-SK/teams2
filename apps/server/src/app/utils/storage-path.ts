import { FileType } from '../_generated/graphql';

export function storagePath(name: string, type: FileType, ref?: string): string {
  return `${type}/${ref}/${name}`;
}
