import React from 'react';
import { Box, Button, Paragraph, Spinner, Text, TextArea } from 'grommet';
import { useParams } from 'react-router-dom';
import { useAppUser } from '../../components/app-user/use-app-user';
import { BasePage } from '../../components/base-page';
import { ErrorPage } from '../../components/error-page';
import { Panel, PanelGroup } from '../../components/panel';
import {
  useCreateNoteMutation,
  useAddTagsToTeamMutation,
  useGetRegistrationLazyQuery,
  useGetNotesLazyQuery,
  useRemoveTagsFromTeamMutation,
  Address,
  OrderInput,
  useUpdateRegistrationFoodOrderMutation,
  useRemoveRegistrationFoodOrderMutation,
} from '../../_generated/graphql';

import { TagList } from '../../components/tag-list';
import { NoteList } from '../../components/note-list';
import { FieldTeamSize } from '../registrations/components/field-teamSize';

import { PanelRegistrationShipping } from './components/panel-shipping';
import { PanelRegistrationBilling } from './components/panel-billing';
import { PanelRegistrationInvoiceItems } from './components/panel-invoice-items';
import { PanelRegistrationDetails } from './components/panel-details';
import { CoachList } from '../team/components/coach-list';
import { RegistrationFilesPanel } from './components/registration-files';

import { LabelValue } from '../../components/label-value';
import { OrderItemList2 } from '../../components/order-item-list2';
import { useNotification } from '../../components/notifications/notification-provider';
import { fullAddress } from '../../utils/format-address';
import { formatContact } from '../../utils/format-contact';
import { emptyOrder, FoodOrderModal } from '../../components/food-order-modal';
import { YesNoDialog } from '../../components/dialogs/yes-no-dialog';

const columnWidth = '460px';

export function RegistrationPage() {
  const { id } = useParams();
  const { isAdmin, isTeamCoach, isEventManager, userLoading } = useAppUser();
  const { notify } = useNotification();
  const [showFoodOrderModal, setShowFoodOrderModal] = React.useState(false);
  const [confirmFoodOrderRemove, setConfirmFoodOrderRemove] = React.useState(false);

  const [removeTag] = useRemoveTagsFromTeamMutation({
    onError: (e) => notify.error('Nepodarilo sa odobrať štítok.', e.message),
  });
  const [addTag] = useAddTagsToTeamMutation({
    onError: (e) => notify.error('Nepodarilo sa pridať štítok.', e.message),
  });

  const [removeOrder] = useRemoveRegistrationFoodOrderMutation({
    onError: (e) => notify.error('Nepodarilo sa zrušiť objednávku jedla.', e.message),
  });

  const [updateOrder] = useUpdateRegistrationFoodOrderMutation({
    onError: (e) => notify.error('Nepodarilo sa upraviť objednávku jedla.', e.message),
  });

  const [
    fetchRegistration,
    { data: regData, loading: regLoading, error: regDataError, refetch: regRefetch },
  ] = useGetRegistrationLazyQuery({
    onError: (e) => notify.error('Nepodarilo sa načítať registráciu.', e.message),
  });

  const [fetchNotes, { data: notesData, loading: notesLoading, refetch: notesRefetch }] =
    useGetNotesLazyQuery({
      onError: (e) => notify.error('Nepodarilo sa načítať poznámky.', e.message),
    });

  const [createNote] = useCreateNoteMutation({ onCompleted: () => notesRefetch() });

  const reg = regData?.getRegistration;
  const invoiceItems = reg?.invoiceItems ?? [];

  React.useEffect(() => {
    if (id) {
      fetchRegistration({ variables: { id } });
      fetchNotes({ variables: { type: 'registration', ref: id } });
    }
  }, [id, fetchRegistration, fetchNotes]);

  const handleOrder = React.useCallback(
    (data: {
      note?: string | null;
      items: { productId: string; name: string; quantity: number }[];
      billTo: Address;
      shipTo?: Address | null;
    }) => {
      if (!reg) {
        return;
      }
      const o: OrderInput = {
        note: data.note,
        items: data.items.map((item) => ({
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          unitPrice: 0,
          price: 0,
        })),
        billTo: { ...data.billTo },
      };
      if (data.shipTo) {
        o.shipTo = { ...data.shipTo };
      }

      updateOrder({
        variables: {
          id: reg.id,
          order: o,
        },
      });
    },
    [reg],
  );

  const canOrderFood = React.useMemo(() => {
    if (reg && (reg.canceledOn || !reg.confirmedOn || !reg.event || reg.foodOrder?.invoicedOn)) {
      return false;
    }
    const diff = new Date(reg?.event?.date ?? 0).getTime() - Date.now();
    const max = 1000 * 60 * 60 * 24 * 7; // 7 days

    return diff > max;
  }, [reg]);

  if (!id || (regDataError && !regLoading)) {
    return <ErrorPage title="Chyba pri získavaní dát o registrácii." />;
  }

  if (!userLoading && !regLoading && !isAdmin() && !isTeamCoach(reg?.teamId)) {
    return <ErrorPage title="Nemáte oprávnenie k tejto stránke." />;
  }

  return (
    <BasePage title="Registrácia">
      {regLoading || !reg ? (
        <Spinner />
      ) : (
        <>
          {reg.canceledOn && (
            <Box direction="row" gap="medium" pad="medium">
              <Text color="red">Táto registrácia bola zrušená.</Text>
            </Box>
          )}

          <Box direction="row" gap="small" wrap>
            <PanelGroup width="1000px">
              <PanelRegistrationDetails
                registration={reg}
                columnWidth={columnWidth}
                readOnly={!!reg.canceledOn}
              />

              {reg.event && (
                <Panel title="Účasť" wrap direction="column" gap="small">
                  <FieldTeamSize registration={reg} readOnly={!!reg.canceledOn} />
                  {reg.program.maxTeamSize &&
                  reg.girlCount + reg.boyCount > reg.program.maxTeamSize ? (
                    <Paragraph color="status-critical">
                      Počet detí v tíme je väčší ako dovoľujú pravidlá programu. Maximálna veľkosť
                      tímu je {reg.program.maxTeamSize}. Na turnaji sa môže súťažne zúčastniť iba
                      povolený počet detí. Ostatní sa môžu zúčastniť ako diváci.
                    </Paragraph>
                  ) : null}
                  {!reg.foodOrder && <Text>Táto registrácia nemá žiadne stravovanie. </Text>}
                  {reg.foodOrder && (
                    <Box gap="small">
                      <Text weight="bold">Stravovanie</Text>
                      <OrderItemList2 order={reg.foodOrder} editable={false} />
                      <LabelValue label="Poznámka k stravovaniu" labelWidth="300px">
                        <TextArea readOnly value={reg.foodOrder.note ?? undefined} />
                      </LabelValue>
                      <LabelValue
                        label="Fakturačná adresa"
                        labelWidth="300px"
                        value={fullAddress(reg.foodOrder.billTo)}
                      />

                      <LabelValue
                        label="Fakturačný kontakt"
                        labelWidth="300px"
                        value={formatContact(reg.foodOrder.billTo)}
                      />
                    </Box>
                  )}
                  <Box direction="row" gap="small">
                    <Button
                      size="small"
                      label={
                        reg.foodOrder && reg.foodOrder.items.length > 0 ? 'Upraviť' : 'Objednať'
                      }
                      onClick={() => setShowFoodOrderModal(true)}
                      disabled={!canOrderFood && !isAdmin() && !isEventManager(reg.event.id)}
                    />
                    <Button
                      size="small"
                      label="Zrušiť objednávku"
                      onClick={() => setConfirmFoodOrderRemove(true)}
                      disabled={
                        !reg.foodOrder ||
                        !!reg.foodOrder.invoicedOn ||
                        (!canOrderFood && !isAdmin() && !isEventManager(reg.event.id))
                      }
                    />
                  </Box>
                </Panel>
              )}

              <Panel title="Súbory" gap="small">
                <RegistrationFilesPanel registrationId={reg.id} regConfirmed={!!reg.confirmedOn} />
              </Panel>

              {isAdmin() && (
                <PanelRegistrationInvoiceItems
                  registration={reg}
                  invoiceItems={invoiceItems}
                  columnWidth={columnWidth}
                  canEdit={isAdmin()}
                  onRefetch={regRefetch}
                  readOnly={!!reg.canceledOn}
                />
              )}

              <PanelRegistrationBilling
                registration={reg}
                columnWidth={columnWidth}
                readOnly={!!reg.canceledOn}
                onUpdate={() => notesRefetch()}
              />

              <PanelRegistrationShipping
                registration={reg}
                columnWidth={columnWidth}
                readOnly={!!reg.canceledOn}
              />
            </PanelGroup>

            <PanelGroup width={{ min: '350px', width: 'auto', max: '400px' }}>
              {(isAdmin() || isTeamCoach(reg.teamId)) && (
                <Panel title="Tréneri">
                  <CoachList coaches={reg?.team?.coaches ?? []} canEdit={false} />
                </Panel>
              )}

              {isAdmin() && (
                <Panel title="Štítky tímu">
                  <Box direction="row" wrap>
                    <TagList
                      tags={reg.team.tags}
                      onRemove={(tagId) =>
                        removeTag({ variables: { teamId: reg.team.id, tagIds: [tagId] } })
                      }
                      onAdd={(tag) =>
                        addTag({ variables: { teamId: reg.team.id, tagIds: [tag.id] } })
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
                      disabled={!!reg.canceledOn}
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
          {showFoodOrderModal && (
            <FoodOrderModal
              availableItems={reg?.event?.foodTypes ?? []}
              order={reg.foodOrder ?? { ...emptyOrder, billTo: { ...reg.billTo } }}
              onClose={() => setShowFoodOrderModal(false)}
              onOrder={(data) => {
                setShowFoodOrderModal(false);
                handleOrder(data);
              }}
            />
          )}

          {confirmFoodOrderRemove && (
            <YesNoDialog
              title="Zrušiť objednávku jedla"
              message="Naozaj chcete zrušiť objednávku jedla?"
              onYes={async () => {
                await removeOrder({ variables: { id: reg.id } });
                notify.info('Objednávka jedla bola zrušená.');
              }}
              onClose={() => setConfirmFoodOrderRemove(false)}
            />
          )}
        </>
      )}
    </BasePage>
  );
}
