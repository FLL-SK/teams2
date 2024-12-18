import React from 'react';
import { Box, Button, Text } from 'grommet';
import { PricelistItemFragmentFragment } from '../_generated/graphql';
import { JustifiedText } from './justified-text';
import { ListHeader2, ListRow2 } from './list-row';
import { Close as CloseIcon } from 'grommet-icons';

interface PricelistItem {
  id: string;
  n: string;
  up: number;
  qty?: number;
}

interface PricelistItemListProps {
  items: PricelistItem[];
  onRemove?: (item: PricelistItem) => unknown;
  onClick?: (item: PricelistItem) => unknown;
  editable?: boolean;
}

export function PricelistItemList(props: PricelistItemListProps) {
  const { items, onRemove, onClick, editable } = props;
  const columns = '1fr 100px 100px auto';

  return (
    <Box>
      <ListHeader2 columns={columns} pad="small">
        <JustifiedText justify="start">Položka</JustifiedText>
        <JustifiedText justify="center">Cena/Jdn.</JustifiedText>
        <JustifiedText justify="center">Množstvo</JustifiedText>
      </ListHeader2>
      {items.map((item) => (
        <ListRow2
          key={item.id}
          columns={columns}
          pad="small"
          align="center"
          onClick={
            editable
              ? (e) => {
                  e.stopPropagation();
                  onClick && onClick(item);
                }
              : undefined
          }
        >
          <Box>
            <Text>{item.n}</Text>
          </Box>
          <JustifiedText justify="center">{item.up}</JustifiedText>
          <JustifiedText justify="center">{item.qty}</JustifiedText>
          {editable && onRemove && (
            <Button
              size="large"
              disabled={!onRemove || item.qty !== 0}
              plain
              hoverIndicator
              icon={<CloseIcon size="small" />}
              onClick={(e) => {
                e.stopPropagation();
                onRemove(item);
              }}
            />
          )}
        </ListRow2>
      ))}
    </Box>
  );
}
