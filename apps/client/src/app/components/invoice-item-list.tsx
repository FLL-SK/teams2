import React from 'react';
import { Box, Button, Text } from 'grommet';
import { InvoiceItemFragmentFragment } from '../generated/graphql';
import { JustifiedText } from './justified-text';
import { ListHeader, ListRow } from './list-row';
import { Close } from 'grommet-icons';

interface InvoiceItemListProps {
  items: InvoiceItemFragmentFragment[];
  onRemove?: (item: InvoiceItemFragmentFragment) => unknown;
  onClick?: (item: InvoiceItemFragmentFragment) => unknown;
}

export function InvoiceItemList(props: InvoiceItemListProps) {
  const { items, onRemove, onClick } = props;

  return (
    <Box>
      <ListHeader columns="1fr 75px 100px 150px auto" pad="small">
        <JustifiedText justify="start">Položka</JustifiedText>
        <JustifiedText justify="center">Množstvo</JustifiedText>
        <JustifiedText justify="center">Cena</JustifiedText>
        <JustifiedText justify="center">Cena celkom</JustifiedText>
      </ListHeader>
      {items.map((item) => (
        <ListRow
          key={item.id}
          columns="1fr 75px 100px 150px auto"
          pad="small"
          align="center"
          onClick={(e) => {
            e.stopPropagation();
            onClick && onClick(item);
          }}
        >
          <Box>
            <Text>{item.text}</Text>
            <Text size="small">{item.note}</Text>
          </Box>
          <JustifiedText justify="center">{item.quantity}</JustifiedText>
          <JustifiedText justify="center">{item.unitPrice}</JustifiedText>
          <JustifiedText justify="center">
            {(item.quantity ?? 0) * (item.unitPrice ?? 0)}
          </JustifiedText>
          {onRemove && (
            <Button
              plain
              hoverIndicator
              icon={<Close size="small" />}
              onClick={(e) => {
                e.stopPropagation();
                onRemove(item);
              }}
            />
          )}
        </ListRow>
      ))}
    </Box>
  );
}
