import React from 'react';
import { Box, Button, Table, TableBody, TableCell, TableHeader, TableRow, Text } from 'grommet';
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

export function OrderItemList2(props: OrderItemListProps) {
  const { order, onRemove, onClick, editable } = props;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableCell justify="start">
            <Text weight="bold">Položka</Text>
          </TableCell>
          <TableCell justify="center">
            <Text weight="bold">Počet</Text>
          </TableCell>
          <TableCell justify="center">
            <Text weight="bold">Cena</Text>
          </TableCell>
          <TableCell justify="center">
            <Text weight="bold">Celkom</Text>
          </TableCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {order.items.map((item) => (
          <TableRow
            key={item.id}
            onClick={
              editable
                ? (e) => {
                    e.stopPropagation();
                    onClick && onClick(item);
                  }
                : undefined
            }
          >
            <TableCell>
              <Text>{item.name}</Text>
            </TableCell>
            <TableCell justify="center">
              <Text>{item.quantity}</Text>
            </TableCell>
            <TableCell justify="center">
              <Text>{item.unitPrice}</Text>
            </TableCell>
            <TableCell justify="center">
              <Text>{(item.quantity ?? 0) * (item.unitPrice ?? 0)}</Text>
            </TableCell>
            <TableCell justify="end">
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
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
