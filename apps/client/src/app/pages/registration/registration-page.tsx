import React from 'react';
import { Anchor, Box, Paragraph, Spinner, Text } from 'grommet';
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

const columnWidth = '460px';

export function RegistrationPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { isAdmin, isTeamCoach } = useAppUser();

  const [removeTag] = useDeleteTagMutation();
  const [addTag] = useAddTagToTeamMutation();

  const {
    data: regData,
    loading: regLoading,
    error: regDataError,
  } = useGetRegistrationQuery({ variables: { id: id ?? '0' } });

  const {
    data: notesData,
    loading: notesLoading,
    refetch: notesRefetch,
  } = useGetNotesQuery({
    variables: { type: 'registration', ref: id ?? '0' },
  });

  const [createNote] = useCreateNoteMutation({ onCompleted: () => notesRefetch() });

  const reg = regData?.getRegistration;

  const canEdit = isAdmin() || isTeamCoach(reg?.team.id);

  if (!id || regDataError) {
    return <ErrorPage title="Chyba pri získavaní dát o registrácii." />;
  }

  return (
    <BasePage title="Registrácia" loading={regLoading}>
      {reg && (
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

            <Panel title="Fakturácia" wrap direction="row" gap="small">
              <Box width={columnWidth}>
                <LabelValueGroup labelWidth="150px" gap="small" direction="row">
                  <LabelValue label="Fakturačná adresa" value={fullAddress(reg.billTo)} />
                  <LabelValue label="Fakturačný kontakt">
                    <Paragraph margin={'none'}>
                      {reg.billTo.contactName}
                      <br />
                      {reg.billTo.email}
                      <br />
                      {reg.billTo.phone}
                    </Paragraph>
                  </LabelValue>
                </LabelValueGroup>
              </Box>
              <Box width={columnWidth}>
                <LabelValueGroup labelWidth="250px" gap="small" direction="row">
                  <FieldInvoiceIssuedOn registration={reg} />
                  <FieldPaidOn registration={reg} />
                </LabelValueGroup>
              </Box>
            </Panel>

            <Panel title="Dodanie" wrap direction="row" gap="small">
              <Box width={columnWidth}>
                <LabelValueGroup labelWidth="150px" gap="small" direction="row">
                  <LabelValue label="Dodacia adresa" value={fullAddress(reg.shipTo)} />
                  <LabelValue label="Kontakt">
                    <Paragraph margin="none">
                      {reg.shipTo.contactName}
                      <br />
                      {reg.shipTo.email}
                      <br />
                      {reg.shipTo.phone}
                    </Paragraph>
                  </LabelValue>
                </LabelValueGroup>
              </Box>
              <Box width={columnWidth}>
                <LabelValueGroup labelWidth="250px" gap="small" direction="row">
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
                      createNote({ variables: { input: { type: 'registration', ref: id, text } } })
                    }
                  />
                )}
              </Panel>
            )}
          </PanelGroup>
        </Box>
      )}
    </BasePage>
  );
}
