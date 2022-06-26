import { File } from '../generated/graphql';

export function getPrefixedName(file: File): string {
  const prefix = file.programId
    ? file.programId.toString()
    : file.eventId
    ? file.eventId.toString()
    : file.teamId.toString();
  return `${prefix}/${file.name}`;
}
