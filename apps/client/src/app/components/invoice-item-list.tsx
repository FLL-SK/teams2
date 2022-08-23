import React from 'react';
import { Box, Button, Text } from 'grommet';
import { InvoiceItemFragmentFragment } from '../generated/graphql';
import { JustifiedText } from './justified-text';
import { ListHeader2, ListRow2 } from './list-row';
import { Close } from 'grommet-icons';

interface InvoiceItemListProps {
  items: InvoiceItemFragmentFragment[];
  onRemove?: (item: InvoiceItemFragmentFragment) => unknown;
  onClick?: (item: InvoiceItemFragmentFragment) => unknown;
  editable?: boolean;
}

export function InvoiceItemList(props: InvoiceItemListProps) {
  const { items, onRemove, onClick, editable } = props;

  return (
    <Box>
      <ListHeader2 columns="1fr 75px 100px 150px auto" pad="small">
        <JustifiedText justify="start">Položka</JustifiedText>
        <JustifiedText justify="center">Množstvo</JustifiedText>
        <JustifiedText justify="center">Cena</JustifiedText>
        <JustifiedText justify="center">Cena celkom</JustifiedText>
      </ListHeader2>
      {items.map((item) => (
        <ListRow2
          key={item.id}
          columns="1fr 75px 100px 150px auto"
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
            <Text>{item.text}</Text>
            <Text size="small">{item.note}</Text>
          </Box>
          <JustifiedText justify="center">{item.quantity}</JustifiedText>
          <JustifiedText justify="center">{item.unitPrice}</JustifiedText>
          <JustifiedText justify="center">
            {(item.quantity ?? 0) * (item.unitPrice ?? 0)}
          </JustifiedText>
          {editable && onRemove && (
            <Button
              size="large"
              plain
              hoverIndicator
              icon={<Close size="small" />}
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
