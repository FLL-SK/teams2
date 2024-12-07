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
  Tabs,
  Tab,
  Box,
} from 'grommet';
import { Modal } from '../../../components/modal';
import React, { useEffect } from 'react';
import { LabelValue } from '../../../components/label-value';

interface Address {
  name: string;
  street: string;
  city: string;
  zip: string;
  companyNumber?: string | null;
  vatNumber?: string | null;
  taxNumber?: string | null;
  contactName?: string | null;
  phone?: string | null;
  email?: string | null;
}

interface FormDataType {
  note?: string | null;
  items: {
    productId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    price: number;
  }[];
  billTo: Address;
  shipTo?: Address | null;
}

export const emptyOrder: FormDataType = {
  note: '',
  items: [{ productId: '', name: '', quantity: 0, unitPrice: 0, price: 0 }],
  billTo: {
    name: '',
    street: '',
    city: '',
    zip: '',
    companyNumber: '',
    vatNumber: '',
    taxNumber: '',
    contactName: '',
    phone: '',
    email: '',
  },
};

export interface FoodOrderModalProps {
  availableItems: { id: string; n: string; up: number }[];
  order: FormDataType | null | undefined;
  onClose: () => void;
  onOrder: (orderData: FormDataType) => void;
}

export function FoodOrderModal(props: FoodOrderModalProps) {
  const [value, setValue] = React.useState<FormDataType>(emptyOrder);
  const [activeTab, setActiveTab] = React.useState(0);

  useEffect(() => {
    const o = props.order ?? emptyOrder;

    const mergedItems = props.availableItems.map((availableItem) => {
      const existingItem = o.items.find((orderItem) => orderItem.productId === availableItem.id);

      const mi: FormDataType['items'][0] = {
        productId: availableItem.id,
        name: availableItem.n,
        quantity: existingItem ? existingItem.quantity : 0,
        unitPrice: availableItem.up,
        price: existingItem ? existingItem.price : 0,
      };
      return mi;
    });

    setValue({ ...o, items: mergedItems });
  }, [props.availableItems, props.order]);

  return (
    <Modal
      onClose={props.onClose}
      title="Objednávka stravovania"
      show={true}
      footer={
        <Box direction="row" gap="medium" width="100%" justify="between">
          <Button
            label="Späť"
            onClick={() => setActiveTab(activeTab - 1)}
            disabled={activeTab == 0}
          />
          <Button label="Zrušiť" onClick={props.onClose} />
          {activeTab == 3 && (
            <Button primary label="Objednať" onClick={() => props.onOrder(value)} />
          )}
          {activeTab < 3 && (
            <Button primary label="Ďalej" onClick={() => setActiveTab(activeTab + 1)} />
          )}
        </Box>
      }
    >
      {props.availableItems.length === 0 && (
        <p>Tento turnaj nemá možnosť objednania stravovania.</p>
      )}
      {value.items.length > 0 && (
        <Form>
          <Tabs activeIndex={activeTab} onActive={(index) => setActiveTab(index)}>
            <Tab title="Jedlo">
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
            </Tab>
            <Tab title="Fakturačná adresa">
              <FormField name="billTo.name" label="Meno" required>
                <TextInput
                  name="billTo.name"
                  value={value.billTo.name}
                  onChange={(event) =>
                    setValue({ ...value, billTo: { ...value.billTo, name: event.target.value } })
                  }
                />
              </FormField>
              <FormField name="billTo.street" label="Ulica" required>
                <TextInput
                  name="billTo.street"
                  value={value.billTo.street}
                  onChange={(event) =>
                    setValue({ ...value, billTo: { ...value.billTo, street: event.target.value } })
                  }
                />
              </FormField>
              <FormField name="billTo.city" label="Mesto" required>
                <TextInput
                  name="billTo.city"
                  value={value.billTo.city}
                  onChange={(event) =>
                    setValue({ ...value, billTo: { ...value.billTo, city: event.target.value } })
                  }
                />
              </FormField>
              <FormField name="billTo.zip" label="PSČ" required>
                <TextInput
                  name="billTo.zip"
                  value={value.billTo.zip}
                  onChange={(event) =>
                    setValue({ ...value, billTo: { ...value.billTo, zip: event.target.value } })
                  }
                />
              </FormField>
            </Tab>
            <Tab title="Fakturačné údaje">
              <FormField name="billTo.companyNumber" label="IČO">
                <TextInput
                  name="billTo.companyNumber"
                  value={value.billTo.companyNumber ?? undefined}
                  onChange={(event) =>
                    setValue({
                      ...value,
                      billTo: { ...value.billTo, companyNumber: event.target.value },
                    })
                  }
                />
              </FormField>
              <FormField name="billTo.taxNumber" label="DIČ">
                <TextInput
                  name="billTo.taxNumber"
                  value={value.billTo.taxNumber ?? undefined}
                  onChange={(event) =>
                    setValue({
                      ...value,
                      billTo: { ...value.billTo, taxNumber: event.target.value },
                    })
                  }
                />
              </FormField>
              <FormField name="billTo.vatNumber" label="IČ DPH">
                <TextInput
                  name="billTo.vatNumber"
                  value={value.billTo.vatNumber ?? undefined}
                  onChange={(event) =>
                    setValue({
                      ...value,
                      billTo: { ...value.billTo, vatNumber: event.target.value },
                    })
                  }
                />
              </FormField>
            </Tab>
            <Tab title="Kontaktné údaje">
              <FormField name="billTo.contactName" label="Kontaktná osoba">
                <TextInput
                  name="billTo.contactName"
                  value={value.billTo.contactName ?? undefined}
                  onChange={(event) =>
                    setValue({
                      ...value,
                      billTo: { ...value.billTo, contactName: event.target.value },
                    })
                  }
                />
              </FormField>
              <FormField name="billTo.phone" label="Telefón">
                <TextInput
                  name="billTo.phone"
                  value={value.billTo.phone ?? undefined}
                  onChange={(event) =>
                    setValue({ ...value, billTo: { ...value.billTo, phone: event.target.value } })
                  }
                />
              </FormField>
              <FormField name="billTo.email" label="Email">
                <TextInput
                  name="billTo.email"
                  value={value.billTo.email ?? undefined}
                  onChange={(event) =>
                    setValue({ ...value, billTo: { ...value.billTo, email: event.target.value } })
                  }
                />
              </FormField>
            </Tab>
          </Tabs>
        </Form>
      )}
    </Modal>
  );
}
