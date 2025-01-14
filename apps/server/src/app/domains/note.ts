import { ObjectId } from 'mongodb';
import { NoteType } from '../_generated/graphql';
import { NoteData, NoteDocument, noteRepository } from '../models';

export async function createNote(
  type: NoteType,
  ref: ObjectId,
  text: string,
  createdBy: ObjectId,
): Promise<NoteDocument> {
  const n: NoteData = { type, ref, text, createdOn: new Date(), createdBy };
  const note = await noteRepository.create(n);
  return note;
}
