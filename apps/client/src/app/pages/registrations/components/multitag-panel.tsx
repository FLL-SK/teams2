import React from 'react';
import { TagList } from '../../../components/tag-list';
import { TagFragmentFragment } from '../../../generated/graphql';
import { Box, Button } from 'grommet';

interface MultitagPanelProps {
  onAdd: (tagIds: string[]) => unknown;
  onRemove: (tagIds: string[]) => unknown;
}

export function MultitagPanel(props: MultitagPanelProps) {
  const { onAdd, onRemove } = props;

  const [selected, setSelected] = React.useState<TagFragmentFragment[]>([]);

  return (
    <Box direction="row" gap="small">
      <Box direction="row" pad="small" background="white">
        <TagList
          tags={selected}
          onRemove={(tagId) => setSelected(selected.filter((t) => t.id !== tagId))}
          onAdd={(tag) => {
            const tagIdx = selected.findIndex((t) => t.id === tag.id);
            if (tagIdx < 0) {
              setSelected([...selected, tag]);
            }
          }}
        />
      </Box>
      <Button
        plain
        size="small"
        label="Pridaj"
        tip="Pridaj štítky vybraným tímom"
        onClick={() => onAdd(selected.map((t) => t.id))}
      />
      <Button
        plain
        size="small"
        label="Odober"
        tip="Odober štítky vybraným tímom"
        onClick={() => onRemove(selected.map((t) => t.id))}
      />
    </Box>
  );
}
