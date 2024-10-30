import React from 'react';
import { Box, Button, Text } from 'grommet';
import { PricelistItemFragmentFragment } from '../_generated/graphql';
import { JustifiedText } from './justified-text';
import { ListHeader2, ListRow2 } from './list-row';
import { Close as CloseIcon } from 'grommet-icons';

interface PricelistItemListProps {
  items: PricelistItemFragmentFragment[];
  onRemove?: (item: PricelistItemFragmentFragment) => unknown;
  onClick?: (item: PricelistItemFragmentFragment) => unknown;
  editable?: boolean;
}

export function PricelistItemList(props: PricelistItemListProps) {
  const { items, onRemove, onClick, editable } = props;
  const columns = '1fr 100px auto';

  return (
    <Box>
      <ListHeader2 columns={columns} pad="small">
        <JustifiedText justify="start">Položka</JustifiedText>
        <JustifiedText justify="center">Cena</JustifiedText>
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
          {editable && onRemove && (
            <Button
              size="large"
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
