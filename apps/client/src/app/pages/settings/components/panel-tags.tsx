import { Spinner } from 'grommet';
import React from 'react';

import { useNotification } from '../../../components/notifications/notification-provider';
import { TagList } from '../../../components/tag-list';
import {
  TagColorType,
  useDeleteTagMutation,
  useGetTagsQuery,
  useRestoreTagMutation,
  useUpdateTagMutation,
} from '../../../_generated/graphql';

export function PanelTags() {
  const { notify } = useNotification();
  const { data, loading } = useGetTagsQuery({ variables: { includeDeleted: true } });

  const [deleteTag] = useDeleteTagMutation({
    onError: (e) => notify.error('Nepodarilo sa vymazať štítok.', e.message),
  });

  const [restoreTag] = useRestoreTagMutation({
    onError: (e) => notify.error('Nepodarilo sa obnoviť štítok.', e.message),
  });

  const [updateTag] = useUpdateTagMutation({
    onError: (e) => notify.error('Nepodarilo sa uložiť zmeny v štítku.', e.message),
  });

  if (loading) {
    return <Spinner />;
  }

  return (
    <TagList
      tags={data?.getTags}
      tagSize="medium"
      onUpdate={(id: string, label: string, color: TagColorType) =>
        updateTag({ variables: { id, input: { label, color } } })
      }
      onRestore={(id: string) => restoreTag({ variables: { id } })}
      onRemove={(id: string) => deleteTag({ variables: { id } })}
    />
  );
}
