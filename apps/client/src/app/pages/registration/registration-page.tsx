import React from 'react';
import { Box, Paragraph, Spinner, Text, TextArea } from 'grommet';
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

const columnWidth = '460px';

export function RegistrationPage() {
  const { id } = useParams();
  const { isAdmin, isTeamCoach, userLoading } = useAppUser();

  const [removeTag] = useRemoveTagsFromTeamMutation();
  const [addTag] = useAddTagsToTeamMutation();

  const [
    fetchRegistration,
    { data: regData, loading: regLoading, error: regDataError, refetch: regRefetch },
  ] = useGetRegistrationLazyQuery();

  const [fetchNotes, { data: notesData, loading: notesLoading, refetch: notesRefetch }] =
    useGetNotesLazyQuery();

  const [createNote] = useCreateNoteMutation({ onCompleted: () => notesRefetch() });

  React.useEffect(() => {
    if (id) {
      fetchRegistration({ variables: { id } });
      fetchNotes({ variables: { type: 'registration', ref: id } });
    }
  }, [id, fetchRegistration, fetchNotes]);

  const reg = regData?.getRegistration;
  const invoiceItems = reg?.invoiceItems ?? [];

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
                  {reg.foodOrder && <Text weight="bold">Stravovanie</Text>}
                  {reg.foodOrder && <OrderItemList2 order={reg.foodOrder} editable={false} />}
                  {reg.foodOrder && (
                    <LabelValue label="Poznámka k stravovaniu" labelWidth="300px">
                      <TextArea readOnly>{reg.foodOrder.note}</TextArea>
                    </LabelValue>
                  )}
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
        </>
      )}
    </BasePage>
  );
}
