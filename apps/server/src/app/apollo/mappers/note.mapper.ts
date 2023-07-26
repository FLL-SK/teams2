import { Note } from '../../generated/graphql';
import { NoteData } from '../../models';

export const NoteMapper = {
  toNote(note: NoteData | null | undefined): Note | null {
    if (!note) {
      return null;
    }
    const u: Omit<Required<Note>, '__typename'> = {
      id: note._id,
      type: note.type,
      ref: note.ref,
      text: note.text,
      title: note.title,

      createdOn: note.createdOn,
      createdBy: note.createdBy,
      updatedOn: note.updatedOn,
      updatedBy: note.updatedBy,
      deletedOn: note.deletedOn,
      deletedBy: note.deletedBy,

      creator: null,
    };
    return u;
  },
};
