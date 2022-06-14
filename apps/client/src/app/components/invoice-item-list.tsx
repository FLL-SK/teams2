import React from 'react';
import { Box, Text } from 'grommet';
import { InvoiceItemFragmentFragment } from '../generated/graphql';
import { JustifiedText } from './justified-text';
import { ListHeader, ListRow } from './list-row';

interface InvoiceItemListProps {
  items: InvoiceItemFragmentFragment[];
}

export function InvoiceItemList(props: InvoiceItemListProps) {
  const { items } = props;

  return (
    <Box>
      <ListHeader columns="1fr 75px 100px 150px auto" pad="small">
        <JustifiedText justify="start">Položka</JustifiedText>
        <JustifiedText justify="center">Množstvo</JustifiedText>
        <JustifiedText justify="center">Cena</JustifiedText>
        <JustifiedText justify="center">Cena celkom</JustifiedText>
      </ListHeader>
      {items.map((item) => (
        <ListRow key={item.lineNo} columns="1fr 75px 100px 150px auto" pad="small" align="center">
          <Box>
            <Text>{item.text}</Text>
            <Text size="small">{item.note}</Text>
          </Box>
          <JustifiedText justify="center">{item.quantity}</JustifiedText>
          <JustifiedText justify="end">{item.unitPrice}</JustifiedText>
          <JustifiedText justify="end">
            {(item.quantity ?? 0) * (item.unitPrice ?? 0)}
          </JustifiedText>
        </ListRow>
      ))}
    </Box>
  );
}
