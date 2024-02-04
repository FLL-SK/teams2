import { ObjectId } from 'mongodb';
import { NoteType } from '../_generated/graphql';
import { ApolloContext } from '../apollo/apollo-context';
import { NoteData, NoteDocument, noteRepository } from '../models';

export async function createNote(
  type: NoteType,
  ref: ObjectId,
  text: string,
  ctx: ApolloContext,
): Promise<NoteDocument> {
  const createdBy = ctx.user._id;
  const n: NoteData = { type, ref, text, createdOn: new Date(), createdBy };
  const note = await noteRepository.create(n);
  return note;
}
