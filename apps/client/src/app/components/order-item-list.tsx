import React from 'react';
import { Box, Button, Text } from 'grommet';
import { OrderFragmentFragment } from '../_generated/graphql';
import { JustifiedText } from './justified-text';
import { ListHeader2, ListRow2 } from './list-row';
import { Close } from 'grommet-icons';

interface OrderItemListProps {
  order: OrderFragmentFragment;
  onRemove?: (item: OrderFragmentFragment['items'][0]) => unknown;
  onClick?: (item: OrderFragmentFragment['items'][0]) => unknown;
  editable?: boolean;
}

export function OrderItemList(props: OrderItemListProps) {
  const { order, onRemove, onClick, editable } = props;
  const columns = '1fr 75px 100px 150px auto';

  return (
    <Box>
      <ListHeader2 columns={columns} pad="small">
        <JustifiedText justify="start">Položka</JustifiedText>
        <JustifiedText justify="center">Množstvo</JustifiedText>
        <JustifiedText justify="center">Cena</JustifiedText>
        <JustifiedText justify="center">Cena celkom</JustifiedText>
      </ListHeader2>
      {order.items.map((item) => (
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
            <Text>{item.name}</Text>
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
