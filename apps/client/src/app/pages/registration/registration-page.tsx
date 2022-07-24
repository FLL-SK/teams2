import React, { useState } from 'react';
import { Anchor, Box, Button, Paragraph, Spinner, Text } from 'grommet';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppUser } from '../../components/app-user/use-app-user';
import { BasePage } from '../../components/base-page';
import { ErrorPage } from '../../components/error-page';
import { LabelValue } from '../../components/label-value';
import { Panel, PanelGroup } from '../../components/panel';
import { UserTags } from '../../components/user-tags';
import {
  useGetNotesQuery,
  useCreateNoteMutation,
  useGetRegistrationQuery,
  useDeleteTagMutation,
  useAddTagToTeamMutation,
  useUpdateRegistrationMutation,
  useCreateInvoiceItemMutation,
  useUpdateInvoiceItemMutation,
  useDeleteInvoiceItemMutation,
  InvoiceItemFragmentFragment,
} from '../../generated/graphql';
import { fullAddress } from '../../utils/format-address';
import { LabelValueGroup } from '../../components/label-value-group';
import { TagList } from '../../components/tag-list';
import { NoteList } from '../../components/note-list';
import { formatDate } from '@teams2/dateutils';
import { FieldShippedOn } from '../registrations/components/field-shippedOn';
import { FieldShipmentGroup } from '../registrations/components/field-shipmentGroup';
import { FieldInvoiceIssuedOn } from '../registrations/components/field-invoiceIssuedOn';
import { FieldPaidOn } from '../registrations/components/field-paidOn';
import { FieldTeamSize } from '../registrations/components/field-teamSize';
import { FieldTeamSizeConfirmedOn } from '../registrations/components/field-teamSizeConfirmedOn';
import { appPath } from '@teams2/common';
import { EditAddressDialog } from '../../components/dialogs/edit-address-dialog';
import { EditContactDialog } from '../../components/dialogs/edit-contact-dialog';
import { EditCompanyRegDialog } from '../../components/dialogs/edit-company-reg-dialog';
import { InvoiceItemList } from '../../components/invoice-item-list';
import { EditInvoiceItemDialog } from '../../components/dialogs/edit-invoice-item-dialog';
import { omit } from 'lodash';

const columnWidth = '460px';

export function RegistrationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, isTeamCoach } = useAppUser();

  const [editBillToAddress, setEditBillToAddress] = useState(false);
  const [editShipToAddress, setEditShipToAddress] = useState(false);
  const [editBillToContact, setEditBillToContact] = useState(false);
  const [editShipToContact, setEditShipToContact] = useState(false);
  const [editBillToDetails, setEditBillToDetails] = useState(false);

  const [invoiceItemAdd, setInvoiceItemAdd] = useState(false);
  const [invoiceItemEdit, setInvoiceItemEdit] = useState<InvoiceItemFragmentFragment>();

  const [removeTag] = useDeleteTagMutation();
  const [addTag] = useAddTagToTeamMutation();
  const [updateRegistration] = useUpdateRegistrationMutation();

  const {
    data: regData,
    loading: regLoading,
    error: regDataError,
    refetch: regRefetch,
  } = useGetRegistrationQuery({ variables: { id: id ?? '0' } });

  const {
    data: notesData,
    loading: notesLoading,
    refetch: notesRefetch,
  } = useGetNotesQuery({
    variables: { type: 'registration', ref: id ?? '0' },
  });

  const [createNote] = useCreateNoteMutation({ onCompleted: () => notesRefetch() });

  const [createInvoiceItem] = useCreateInvoiceItemMutation({ onCompleted: () => regRefetch() });
  const [updateInvoiceItem] = useUpdateInvoiceItemMutation({ onCompleted: () => regRefetch() });
  const [deleteInvoiceItem] = useDeleteInvoiceItemMutation({ onCompleted: () => regRefetch() });

  const reg = regData?.getRegistration;
  const invoiceItems = reg?.invoiceItems ?? [];

  const canEdit = isAdmin() || isTeamCoach(reg?.team.id);

  if (!id || regDataError) {
    return <ErrorPage title="Chyba pri získavaní dát o registrácii." />;
  }

  return (
    <BasePage title="Registrácia" loading={regLoading}>
      {reg && (
        <>
          <Box direction="row" gap="small" wrap>
            <PanelGroup width="1000px">
              <Panel title="Detaily registrácie" wrap direction="row" gap="small">
                <Box width={columnWidth}>
                  <LabelValueGroup labelWidth="150px" gap="small" direction="row">
                    <LabelValue label="Program">
                      <Anchor label={reg.program.name} href={appPath.program(reg.program.id)} />
                    </LabelValue>
                    <LabelValue label="Turnaj">
                      <Anchor label={reg.event.name} href={appPath.event(reg.event.id)} />
                    </LabelValue>
                    <LabelValue label="Tím">
                      <Anchor label={reg.team.name} href={appPath.team(reg.team.id)} />
                    </LabelValue>
                    <LabelValue label="Zriaďovateľ tímu" value={fullAddress(reg.team.address)} />
                    <LabelValue label="Dátum registrácie" value={formatDate(reg.registeredOn)} />
                  </LabelValueGroup>
                </Box>
                <Box width={columnWidth}>
                  <LabelValueGroup labelWidth="150px" gap="small">
                    {reg.team.coaches
                      .filter((coach) => !coach.deletedOn)
                      .map((coach) => (
                        <LabelValue label={coach.name} key={coach.id}>
                          <Text>{coach.username}</Text>
                          <Text>{coach.phone}</Text>
                        </LabelValue>
                      ))}
                  </LabelValueGroup>
                </Box>
              </Panel>

              <Panel title="Účasť" wrap direction="row" gap="small">
                <Box width={columnWidth}>
                  <LabelValueGroup labelWidth="250px" gap="small" direction="row">
                    <FieldTeamSize registration={reg} />
                    <FieldTeamSizeConfirmedOn registration={reg} />
                  </LabelValueGroup>
                </Box>
              </Panel>

              <Panel title="Poplatky" gap="medium">
                {invoiceItems.length === 0 && (
                  <Text>
                    Tento turnaj preberá poplatky z programu v rámci ktorého je organizovaný.
                    Pridaním poplatku je možné definovať poplatky špecifické pre tento turnaj.
                  </Text>
                )}
                {invoiceItems.length > 0 && (
                  <InvoiceItemList
                    items={invoiceItems}
                    onRemove={(i) => deleteInvoiceItem({ variables: { id: i.id } })}
                    onClick={(item) => setInvoiceItemEdit(item)}
                    editable={canEdit}
                  />
                )}
                <Box direction="row">
                  <Button
                    label="Pridať poplatok"
                    onClick={() => setInvoiceItemAdd(true)}
                    disabled={!canEdit}
                  />
                </Box>
              </Panel>

              <Panel title="Fakturácia" wrap direction="row" gap="small">
                <Box width={columnWidth}>
                  <LabelValueGroup labelWidth="150px" gap="small" direction="row">
                    <LabelValue label="Fakturačná adresa">
                      <Box>
                        <Text>{fullAddress(reg.billTo)}</Text>
                        <Anchor
                          size="small"
                          label="Upraviť"
                          onClick={() => setEditBillToAddress(true)}
                        />
                      </Box>
                    </LabelValue>

                    <LabelValue label="IČO" value={reg.billTo.companyNumber} />
                    <LabelValue label="DIČ" value={reg.billTo.taxNumber} />
                    <LabelValue label="IČ-DPH" value={reg.billTo.vatNumber} />
                    <LabelValue label="">
                      <Anchor
                        size="small"
                        label="Upraviť"
                        onClick={() => setEditBillToDetails(true)}
                      />
                    </LabelValue>
                  </LabelValueGroup>
                </Box>
                <Box width={columnWidth}>
                  <LabelValueGroup labelWidth="250px" gap="small" direction="row">
                    <LabelValue label="Fakturačný kontakt">
                      <Box>
                        <Paragraph margin={'none'}>
                          {reg.billTo.contactName}
                          <br />
                          {reg.billTo.email}
                          <br />
                          {reg.billTo.phone}
                        </Paragraph>
                        <Anchor
                          size="small"
                          label="Upraviť"
                          onClick={() => setEditBillToContact(true)}
                        />
                      </Box>
                    </LabelValue>
                    <FieldInvoiceIssuedOn registration={reg} />
                    <FieldPaidOn registration={reg} />
                  </LabelValueGroup>
                </Box>
              </Panel>

              <Panel title="Dodanie" wrap direction="row" gap="small">
                <Box width={columnWidth}>
                  <LabelValueGroup labelWidth="150px" gap="small" direction="row">
                    <LabelValue label="Dodacia adresa">
                      <Box>
                        <Text>{fullAddress(reg.shipTo)}</Text>
                        <Anchor
                          size="small"
                          label="Upraviť"
                          onClick={() => setEditShipToAddress(true)}
                        />
                      </Box>
                    </LabelValue>
                  </LabelValueGroup>
                </Box>
                <Box width={columnWidth}>
                  <LabelValueGroup labelWidth="250px" gap="small" direction="row">
                    <LabelValue label="Kontakt">
                      <Box>
                        <Paragraph margin="none">
                          {reg.shipTo.contactName}
                          <br />
                          {reg.shipTo.email}
                          <br />
                          {reg.shipTo.phone}
                        </Paragraph>
                        <Anchor
                          size="small"
                          label="Upraviť"
                          onClick={() => setEditShipToContact(true)}
                        />
                      </Box>
                    </LabelValue>
                    <FieldShipmentGroup registration={reg} />
                    <FieldShippedOn registration={reg} />
                  </LabelValueGroup>
                </Box>
              </Panel>
            </PanelGroup>
            <PanelGroup width={{ min: '350px', width: 'auto' }}>
              {canEdit && (
                <Panel title="Tréneri">
                  <Box direction="row" wrap>
                    <UserTags canEdit={canEdit} users={reg?.team?.coaches ?? []} />
                  </Box>
                </Panel>
              )}

              {isAdmin() && (
                <Panel title="Štítky tímu">
                  <Box direction="row" wrap>
                    <TagList
                      tags={reg?.team?.tags}
                      onRemove={(id) => removeTag({ variables: { id } })}
                      onAdd={(tag) =>
                        addTag({ variables: { teamId: reg?.team?.id ?? '0', tagId: tag.id } })
                      }
                    />
                  </Box>
                </Panel>
              )}
              {isAdmin() && (
                <Panel title="Poznámky">
                  {notesLoading ? (
                    <Spinner />
                  ) : (
                    <NoteList
                      notes={notesData?.getNotes ?? []}
                      limit={20}
                      onCreate={(text) =>
                        createNote({
                          variables: { input: { type: 'registration', ref: id, text } },
                        })
                      }
                    />
                  )}
                </Panel>
              )}
            </PanelGroup>
          </Box>
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
          <EditAddressDialog
            show={editShipToAddress}
            address={reg?.shipTo}
            onClose={() => setEditShipToAddress(false)}
            onSubmit={(data) =>
              updateRegistration({
                variables: { id: reg.id, input: { shipTo: { ...reg.shipTo, ...data } } },
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

          <EditContactDialog
            show={editShipToContact}
            contact={reg.shipTo}
            onClose={() => setEditShipToContact(false)}
            onSubmit={(data) =>
              updateRegistration({
                variables: { id: reg.id, input: { shipTo: { ...reg.shipTo, ...data } } },
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

          <EditInvoiceItemDialog
            show={!!invoiceItemEdit || invoiceItemAdd}
            item={invoiceItemEdit}
            onClose={() => {
              setInvoiceItemAdd(false);
              setInvoiceItemEdit(undefined);
            }}
            onSubmit={(values) => {
              if (invoiceItemAdd) {
                createInvoiceItem({
                  variables: { type: 'registration', refId: id ?? '0', item: omit(values, 'id') },
                });
              } else {
                updateInvoiceItem({
                  variables: { id: values.id ?? '0', item: values },
                });
              }
            }}
          />
        </>
      )}
    </BasePage>
  );
}
