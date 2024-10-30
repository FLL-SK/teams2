import { Button, Form, FormField, Table, TextInput } from 'grommet';
import { Modal } from '../../../components/modal';
import React, { useEffect } from 'react';

interface FormDataType {
  orderItems: {
    productId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    price: number;
  }[];
}

export interface FoodOrderModalProps {
  availableItems: { id: string; n: string; up: number }[];
  orderItems: FormDataType['orderItems'];
  onClose: () => void;
  onOrder: (orderData: FormDataType['orderItems']) => void;
}

export function FoodOrderModal(props: FoodOrderModalProps) {
  const [value, setValue] = React.useState<FormDataType>({
    orderItems: [{ productId: '', name: '', quantity: 0, unitPrice: 0, price: 0 }],
  });

  useEffect(() => {
    console.log('availableItems', props.availableItems);
    console.log('orderItems', props.orderItems);
    const mergedItems = props.availableItems.map((availableItem) => {
      const existingItem = props.orderItems.find(
        (orderItem) => orderItem.productId === availableItem.id,
      );
      console.log('existingItem', availableItem, existingItem);
      const mi: FormDataType['orderItems'][0] = {
        productId: availableItem.id,
        name: availableItem.n,
        quantity: existingItem ? existingItem.quantity : 0,
        unitPrice: availableItem.up,
        price: existingItem ? existingItem.price : 0,
      };
      return mi;
    });
    console.log('mergedItems', mergedItems);
    setValue({ orderItems: mergedItems });
  }, [props.availableItems, props.orderItems]);

  const handleFormChange = (newValue: FormDataType) => {
    console.log('newValue', newValue);
    console.log('value', value);
    const nv: FormDataType = { ...value };
    if (newValue.orderItems) {
      const itms: FormDataType['orderItems'] = [...value.orderItems];
      for (let i = 0; i < newValue.orderItems.length; i++) {
        if (!newValue.orderItems[i]) {
          continue;
        }
        const qty = parseInt((newValue.orderItems[i].quantity ?? '0').toString());
        itms[i] = {
          ...itms[i],
          quantity: newValue.orderItems[i] ? qty : 0,
          price: itms[i].unitPrice * (newValue.orderItems[i] ? qty : 0),
        };
      }
      nv.orderItems = itms;
    }
    setValue(nv);
  };

  console.log('value', value);

  return (
    <Modal
      onClose={props.onClose}
      title="Objednávka stravovania"
      show={true}
      footer={<Button primary label="Objednať" onClick={() => props.onOrder(value.orderItems)} />}
    >
      {props.availableItems.length === 0 && (
        <p>Tento turnaj nemá možnosť objednania stravovania.</p>
      )}
      {value.orderItems.length > 0 && (
        <Form onChange={handleFormChange}>
          <Table>
            <thead>
              <tr>
                <th>Typ</th>
                <th>Množstvo</th>
              </tr>
            </thead>
            <tbody>
              {value.orderItems.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>

                  <td>
                    <FormField name={`orderItems[${index}].quantity`} required>
                      <TextInput
                        type="number"
                        name={`orderItems[${index}].quantity`}
                        value={item.quantity}
                      />
                    </FormField>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Form>
      )}
    </Modal>
  );
}
