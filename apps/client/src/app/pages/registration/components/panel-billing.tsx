import { appPath } from '@teams2/common';
import { formatDate } from '@teams2/dateutils';
import { Anchor, Box, Button, Paragraph, Spinner, Text } from 'grommet';
import React, { useState } from 'react';
import { useAppUser } from '../../../components/app-user/use-app-user';
import { EditAddressDialog } from '../../../components/dialogs/edit-address-dialog';
import { EditCompanyRegDialog } from '../../../components/dialogs/edit-company-reg-dialog';
import { EditContactDialog } from '../../../components/dialogs/edit-contact-dialog';
import { LabelValue } from '../../../components/label-value';
import { LabelValueGroup } from '../../../components/label-value-group';
import { useNotification } from '../../../components/notifications/notification-provider';
import { Panel } from '../../../components/panel';
import {
  RegistrationFragmentFragment,
  useCreateRegistrationInvoiceMutation,
  useEmailRegistrationInvoiceMutation,
  useUpdateRegistrationMutation,
} from '../../../generated/graphql';
import { fullAddress } from '../../../utils/format-address';
import { FieldInvoiceIssuedOn } from '../../registrations/components/field-invoiceIssuedOn';
import { FieldPaidOn } from '../../registrations/components/field-paidOn';

interface PanelRegistrationBillingProps {
  registration: RegistrationFragmentFragment;
  columnWidth: string;
  readOnly: boolean;
  onUpdate: () => void;
}

export function PanelRegistrationBilling(props: PanelRegistrationBillingProps) {
  const { registration: reg, columnWidth, readOnly, onUpdate } = props;
  const { isAdmin } = useAppUser();
  const { notify } = useNotification();

  const [editBillToAddress, setEditBillToAddress] = useState(false);
  const [editBillToContact, setEditBillToContact] = useState(false);
  const [editBillToDetails, setEditBillToDetails] = useState(false);

  const [invoiceProcessing, setInvoiceProcessing] = useState<NodeJS.Timeout>();
  const [invoiceBeingSent, setInvoiceBeingSent] = useState<NodeJS.Timeout>();

  const [updateRegistration] = useUpdateRegistrationMutation({
    onError: (e) => notify.error('Nepodarilo sa aktualizova?? registr??ciu.', e.message),
  });
  const [createInvoice] = useCreateRegistrationInvoiceMutation({
    onError: (e) => notify.error('Nepodarilo sa vytvori?? fakt??ru.', e.message),
  });
  const [emailInvoice] = useEmailRegistrationInvoiceMutation({
    onError: (e) => notify.error('Nepodarilo sa vytvori?? fakt??ru.', e.message),
  });

  return (
    <>
      <Panel title="Faktur??cia" wrap direction="row" gap="small">
        <Box width={columnWidth}>
          <LabelValueGroup labelWidth="150px" gap="small" direction="row">
            <LabelValue label="Faktura??n?? adresa">
              <Box>
                <Text>{fullAddress(reg.billTo)}</Text>
                <Anchor
                  disabled={!!reg.invoiceIssuedOn || readOnly}
                  size="small"
                  label="Upravi??"
                  onClick={() => setEditBillToAddress(true)}
                />
              </Box>
            </LabelValue>

            <LabelValue label="I??O" value={reg.billTo.companyNumber} />
            <LabelValue label="DI??" value={reg.billTo.taxNumber} />
            <LabelValue label="I??-DPH" value={reg.billTo.vatNumber} />
            <LabelValue label="">
              <Anchor
                disabled={!!reg.invoiceIssuedOn || readOnly}
                size="small"
                label="Upravi??"
                onClick={() => setEditBillToDetails(true)}
              />
            </LabelValue>
          </LabelValueGroup>
        </Box>

        <Box width={columnWidth} gap="small">
          <LabelValueGroup labelWidth="250px" gap="small" direction="row">
            <LabelValue label="Faktura??n?? kontakt">
              <Box>
                <Paragraph margin={'none'}>
                  {reg.billTo.contactName}
                  <br />
                  {reg.billTo.email}
                  <br />
                  {reg.billTo.phone}
                </Paragraph>
                <Anchor
                  disabled={!!reg.invoiceIssuedOn || readOnly}
                  size="small"
                  label="Upravi??"
                  onClick={() => setEditBillToContact(true)}
                />
              </Box>
            </LabelValue>

            <FieldInvoiceIssuedOn registration={reg} readOnly={readOnly} />
            {invoiceProcessing && (
              <LabelValue label="">
                <Spinner />
              </LabelValue>
            )}
            {reg.invoiceRef && (
              <LabelValue label="">
                <Anchor
                  disabled={!reg.invoiceRef || readOnly}
                  size="small"
                  label="Otvori??"
                  href={appPath.sfShowInvoice(reg.invoiceRef)}
                />
              </LabelValue>
            )}

            <LabelValue label="Odoslan??">
              {invoiceBeingSent && <Spinner />}
              {!invoiceBeingSent && (
                <Text>{reg.invoiceSentOn ? formatDate(reg.invoiceSentOn) : '-'}</Text>
              )}
            </LabelValue>

            <FieldPaidOn registration={reg} readOnly={readOnly} />
          </LabelValueGroup>

          {isAdmin() && (
            <Box direction="row" width="100%" justify="end" gap="small">
              <Button
                disabled={!!reg.invoiceIssuedOn || !!invoiceProcessing}
                label="Vytvori?? fakt??ru"
                onClick={() => {
                  const t = setTimeout(() => setInvoiceProcessing(undefined), 15000);
                  setInvoiceProcessing(t);
                  createInvoice({
                    variables: { id: reg.id },
                    onCompleted: () => {
                      clearTimeout(t);
                      setInvoiceProcessing(undefined);
                      notify.info('Fakt??ra bola vytvoren??.');
                    },
                  });
                }}
              />
              <Button
                disabled={!reg.invoiceIssuedOn || !!invoiceProcessing || !!invoiceBeingSent}
                label="Posla?? fakt??ru"
                onClick={() => {
                  const t = setTimeout(() => setInvoiceBeingSent(undefined), 15000);
                  setInvoiceBeingSent(t);
                  emailInvoice({
                    variables: { id: reg.id },
                    onCompleted: () => {
                      clearTimeout(t);
                      setInvoiceBeingSent(undefined);
                      notify.info('Fakt??ra bola poslan??.');
                      onUpdate();
                    },
                  });
                }}
              />
            </Box>
          )}
        </Box>
      </Panel>

      <EditAddressDialog
        show={editBillToAddress}
        address={reg?.billTo}
        onClose={() => setEditBillToAddress(false)}
        onSubmit={(data) =>
          updateRegistration({
            variables: { id: reg.id, input: { billTo: { ...reg.billTo, ...data } } },
          })
        }
      />

      <EditContactDialog
        show={editBillToContact}
        contact={reg.billTo}
        onClose={() => setEditBillToContact(false)}
        onSubmit={(data) =>
          updateRegistration({
            variables: { id: reg.id, input: { billTo: { ...reg.billTo, ...data } } },
          })
        }
      />

      <EditCompanyRegDialog
        show={editBillToDetails}
        companyReg={reg.shipTo}
        onClose={() => setEditBillToDetails(false)}
        onSubmit={(data) =>
          updateRegistration({
            variables: { id: reg.id, input: { billTo: { ...reg.billTo, ...data } } },
          })
        }
      />
    </>
  );
}
