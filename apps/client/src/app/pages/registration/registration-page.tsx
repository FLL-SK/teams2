import React from 'react';
import { Box, Spinner, Text } from 'grommet';
import { useParams } from 'react-router-dom';
import { useAppUser } from '../../components/app-user/use-app-user';
import { BasePage } from '../../components/base-page';
import { ErrorPage } from '../../components/error-page';
import { Panel, PanelGroup } from '../../components/panel';
import { UserTags } from '../../components/user-tags';
import {
  useGetNotesQuery,
  useCreateNoteMutation,
  useGetRegistrationQuery,
  useDeleteTagMutation,
  useAddTagToTeamMutation,
} from '../../generated/graphql';
import { LabelValueGroup } from '../../components/label-value-group';
import { TagList } from '../../components/tag-list';
import { NoteList } from '../../components/note-list';
import { FieldTeamSize } from '../registrations/components/field-teamSize';
import { FieldTeamSizeConfirmedOn } from '../registrations/components/field-teamSizeConfirmedOn';
import { PanelRegistrationShipping } from './components/panel-shipping';
import { PanelRegistrationBilling } from './components/panel-billing';
import { PanelRegistrationInvoiceItems } from './components/panel-invoice-items';
import { PanelRegistrationDetails } from './components/panel-details';

const columnWidth = '460px';

export function RegistrationPage() {
  const { id } = useParams();
  const { isAdmin, isTeamCoach } = useAppUser();

  const [removeTag] = useDeleteTagMutation();
  const [addTag] = useAddTagToTeamMutation();

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

  const reg = regData?.getRegistration;
  const invoiceItems = reg?.invoiceItems ?? [];

  const canEdit = isAdmin() || isTeamCoach(reg?.team.id);

  if (!id || regDataError) {
    return <ErrorPage title="Chyba pri získavaní dát o registrácii." />;
  }

  return (
    <BasePage title="Registrácia" loading={regLoading}>
      {reg?.canceledOn && (
        <Box direction="row" gap="medium">
          <Text color="red">Táto registrácia bola zrušená.</Text>
        </Box>
      )}
      {reg && (
        <Box direction="row" gap="small" wrap>
          <PanelGroup width="1000px">
            <PanelRegistrationDetails registration={reg} columnWidth={columnWidth} />

            <Panel title="Účasť" wrap direction="row" gap="small">
              <Box width={columnWidth}>
                <LabelValueGroup labelWidth="250px" gap="small" direction="row">
                  <FieldTeamSize registration={reg} />
                  <FieldTeamSizeConfirmedOn registration={reg} />
                </LabelValueGroup>
              </Box>
            </Panel>

            <PanelRegistrationInvoiceItems
              registration={reg}
              invoiceItems={invoiceItems}
              columnWidth={columnWidth}
              canEdit={canEdit}
              onRefetch={regRefetch}
            />

            <PanelRegistrationBilling registration={reg} columnWidth={columnWidth} />
            <PanelRegistrationShipping registration={reg} columnWidth={columnWidth} />
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
      )}
    </BasePage>
  );
}
