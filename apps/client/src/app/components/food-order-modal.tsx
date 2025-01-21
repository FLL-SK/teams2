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
  TableHeader,
} from 'grommet';
import { Modal } from './modal';
import React, { useEffect } from 'react';
import { LabelValue } from './label-value';
import { parse } from 'path';
import { ProgramUpdateLevel } from 'typescript';
import { formatDate } from '@teams2/dateutils';

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
  invoicedOn?: string | null;
  invoiceRef?: string | null;
  sentOn?: string | null;
}

export const emptyOrder: FormDataType = {
  note: '',
  items: [],
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
    const o = props.order ? { ...props.order, billTo: { ...props.order.billTo } } : emptyOrder;

    // get available items that are not in the order
    const ai = props.availableItems
      .filter((ai) => !o.items.find((oi) => oi.productId === ai.id))
      .map((i) => {
        const mi: FormDataType['items'][0] = {
          productId: i.id,
          name: i.n,
          quantity: 0,
          unitPrice: i.up,
          price: 0,
        };
        return mi;
      });

    const oi = o.items.map((i) => {
      const mi: FormDataType['items'][0] = {
        productId: i.productId,
        name: i.name,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        price: i.price,
      };
      return mi;
    });

    const mergedItems = [...oi, ...ai];
    mergedItems.sort((a, b) => a.name.localeCompare(b.name));

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

      {props.order?.invoicedOn && (
        <p>
          Objednávka už bola fakturovaná dňa {formatDate(props.order.invoicedOn)} s referenciou{' '}
          {props.order.invoiceRef}
        </p>
      )}

      {value.items.length > 0 && (
        <Form
          value={value}
          onChange={(data: FormDataType) => {
            data.items.forEach((item) => {
              item.quantity = parseInt(item.quantity.toString());
              item.price = Math.round(item.quantity * item.unitPrice * 100) / 100;
            });
            setValue(data);
          }}
        >
          <Tabs activeIndex={activeTab} onActive={(index) => setActiveTab(index)}>
            <Tab title="Jedlo">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableCell>
                      <Text>Typ</Text>
                    </TableCell>
                    <TableCell>
                      <Text>Množstvo</Text>
                    </TableCell>
                    <TableCell>
                      <Text>Jdn. cena</Text>
                    </TableCell>
                    <TableCell>
                      <Text>Cena</Text>
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {value.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Text>{item.name}</Text>
                      </TableCell>

                      <TableCell align="right" width="xsmall">
                        <FormField name={`items[${index}].quantity`} required>
                          <TextInput type="number" name={`items[${index}].quantity`} />
                        </FormField>
                      </TableCell>
                      <TableCell align="right">
                        <Text>{item.unitPrice} €</Text>
                      </TableCell>
                      <TableCell align="right">
                        <Text>{item.price} €</Text>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <FormField label="Poznámka" name="note">
                <TextArea name="note" placeholder="Poznámka" />
              </FormField>
            </Tab>
            <Tab title="Fakturačná adresa">
              <FormField name="billTo.name" label="Meno" required>
                <TextInput name="billTo.name" />
              </FormField>
              <FormField name="billTo.street" label="Ulica" required>
                <TextInput name="billTo.street" />
              </FormField>
              <FormField name="billTo.city" label="Mesto" required>
                <TextInput name="billTo.city" />
              </FormField>
              <FormField name="billTo.zip" label="PSČ" required>
                <TextInput name="billTo.zip" />
              </FormField>
            </Tab>
            <Tab title="Fakturačné údaje">
              <FormField name="billTo.companyNumber" label="IČO">
                <TextInput name="billTo.companyNumber" />
              </FormField>
              <FormField name="billTo.taxNumber" label="DIČ">
                <TextInput name="billTo.taxNumber" />
              </FormField>
              <FormField name="billTo.vatNumber" label="IČ DPH">
                <TextInput name="billTo.vatNumber" />
              </FormField>
            </Tab>
            <Tab title="Kontaktné údaje">
              <FormField name="billTo.contactName" label="Kontaktná osoba">
                <TextInput name="billTo.contactName" />
              </FormField>
              <FormField name="billTo.phone" label="Telefón">
                <TextInput name="billTo.phone" />
              </FormField>
              <FormField name="billTo.email" label="Email">
                <TextInput name="billTo.email" />
              </FormField>
            </Tab>
          </Tabs>
        </Form>
      )}
    </Modal>
  );
}
