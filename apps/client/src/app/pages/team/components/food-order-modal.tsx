import {
  Button,
  Form,
  FormField,
  Text,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TextArea,
  TextInput,
} from 'grommet';
import { Modal } from '../../../components/modal';
import React, { useEffect } from 'react';
import { LabelValue } from '../../../components/label-value';

interface FormDataType {
  note?: string | null;
  items: {
    productId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    price: number;
  }[];
}

export interface FoodOrderModalProps {
  availableItems: { id: string; n: string; up: number }[];
  order: FormDataType;
  onClose: () => void;
  onOrder: (orderData: FormDataType) => void;
}

export function FoodOrderModal(props: FoodOrderModalProps) {
  const [value, setValue] = React.useState<FormDataType>({
    note: '',
    items: [{ productId: '', name: '', quantity: 0, unitPrice: 0, price: 0 }],
  });

  useEffect(() => {
    const mergedItems = props.availableItems.map((availableItem) => {
      const existingItem = props.order.items.find(
        (orderItem) => orderItem.productId === availableItem.id,
      );

      const mi: FormDataType['items'][0] = {
        productId: availableItem.id,
        name: availableItem.n,
        quantity: existingItem ? existingItem.quantity : 0,
        unitPrice: availableItem.up,
        price: existingItem ? existingItem.price : 0,
      };
      return mi;
    });

    setValue({ ...props.order, items: mergedItems });
  }, [props.availableItems, props.order]);

  return (
    <Modal
      onClose={props.onClose}
      title="Objednávka stravovania"
      show={true}
      footer={<Button primary label="Objednať" onClick={() => props.onOrder(value)} />}
    >
      {props.availableItems.length === 0 && (
        <p>Tento turnaj nemá možnosť objednania stravovania.</p>
      )}
      {value.items.length > 0 && (
        <Form>
          <Table>
            <thead>
              <tr>
                <th>
                  <Text>Typ</Text>
                </th>
                <th>
                  <Text>Množstvo</Text>
                </th>
              </tr>
            </thead>
            <TableBody>
              {value.items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Text>{item.name}</Text>
                  </TableCell>

                  <TableCell align="right" width={'xs'}>
                    <FormField name={`orderItems[${index}].quantity`} required>
                      <TextInput
                        type="number"
                        name={`orderItems[${index}].quantity`}
                        value={item.quantity}
                        onChange={(e) => {
                          const v: FormDataType = { ...value };
                          v.items[index].quantity = e.target.valueAsNumber;
                          setValue(v);
                        }}
                      />
                    </FormField>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <LabelValue label="Poznámka">
            <TextArea
              name="note"
              placeholder="Poznámka"
              value={value.note ?? undefined}
              onChange={(event) => setValue({ ...value, note: event.target.value })}
            />
          </LabelValue>
        </Form>
      )}
    </Modal>
  );
}
