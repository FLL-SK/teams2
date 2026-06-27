import React, { useEffect } from 'react';
import {
  Box,
  Button,
  CheckBox,
  DateInput,
  Form,
  FormField,
  Grid,
  TextArea,
  TextInput,
  Text,
  CheckBoxGroup,
} from 'grommet';
import { useState } from 'react';
import { ProgramListFragmentFragment } from '../../_generated/graphql';
import { Modal } from '../modal';
import { toUtcDateString, toZonedDateString } from '@teams2/dateutils';

interface EditProgramDialogProps {
  show?: boolean;
  program?: ProgramListFragmentFragment;
  onClose: () => void;
  onSubmit: (values: FormFields) => Promise<unknown>;
}

interface FormFields {
  name: string;
  group?: string;
  description?: string;
  color?: string;
  conditions?: string;
  startDate: string;
  endDate: string;
  maxTeams?: number;
  maxTeamSize?: number;
  regNormalEnabled?: boolean;
  regClassPackEnabled?: boolean;
}

export function EditProgramDialog(props: EditProgramDialogProps) {
  const { show, program, onClose, onSubmit } = props;
  const [teamCountLimited, setTeamCountLimited] = useState<boolean>(
    (!!program?.maxTeams && program.maxTeams > 0) ?? false,
  );
  const [teamSizeLimited, setTeamSizeLimited] = useState<boolean>(
    (!!program?.maxTeamSize && program.maxTeamSize > 0) ?? false,
  );
  const [formValues, setFormValues] = useState<FormFields>({
    name: '',
    startDate: '',
    endDate: '',
    regNormalEnabled: true,
  });

  useEffect(() => {
    setFormValues({
      name: program?.name ?? '',
      group: program?.group ?? '',
      description: program?.description ?? '',
      conditions: program?.conditions ?? '',
      startDate: toZonedDateString(program?.startDate) ?? '',
      endDate: toZonedDateString(program?.endDate) ?? '',
      maxTeams: program?.maxTeams ?? 0,
      maxTeamSize: program?.maxTeamSize ?? 0,
      regNormalEnabled: program?.regTypesAllowed?.includes('NORMAL') ?? true,
      regClassPackEnabled: program?.regTypesAllowed?.includes('CLASS_PACK') ?? false,
    });
    setTeamCountLimited(!!program?.maxTeams && program.maxTeams > 0);
    setTeamSizeLimited(!!program?.maxTeamSize && program.maxTeamSize > 0);
  }, [program]);

  if (!show) {
    return null;
  }

  const handleSubmit = async ({ value }: { value: FormFields }) => {
    const result = {
      ...value,
      startDate: toUtcDateString(value.startDate) ?? '',
      endDate: toUtcDateString(value.endDate) ?? '',
      maxTeams: teamCountLimited && value.maxTeams ? Number(value.maxTeams) : 0,
      maxTeamSize: teamSizeLimited && value.maxTeamSize ? Number(value.maxTeamSize) : 0,
      regTypesAllowed: [
        ...(value.regNormalEnabled ? ['NORMAL'] : []),
        ...(value.regClassPackEnabled ? ['CLASS_PACK'] : []),
      ],
    };
    delete result.regNormalEnabled;
    delete result.regClassPackEnabled;
    await onSubmit(result);
    onClose();
  };

  const regValidError =
    !formValues.regNormalEnabled && !formValues.regClassPackEnabled
      ? 'Musí byť povolený aspoň jeden typ registrácie.'
      : undefined;

  return (
    <Modal
      title={!program ? 'Nový program' : 'Detaily programu'}
      onClose={onClose}
      width="large"
      height="auto"
      overflow="scroll"
    >
      <Form
        onSubmit={handleSubmit}
        messages={{ required: 'Povinný údaj' }}
        value={formValues}
        onChange={setFormValues}
      >
        <FormField label="Názov" name="name" required autoFocus>
          <TextInput name="name" />
        </FormField>
        <FormField label="Skupina programov" name="group">
          <TextInput name="group" />
        </FormField>

        <Grid columns={['1fr', '1fr']} gap="small">
          <FormField label="Začiatok programu" name="startDate">
            <DateInput name="startDate" format="dd.mm.yyyy" />
          </FormField>
          <FormField label="Koniec programu" name="endDate">
            <DateInput name="endDate" format="dd.mm.yyyy" />
          </FormField>

          <CheckBox
            label="Obmedziť počet tímov"
            checked={teamCountLimited}
            onChange={() => setTeamCountLimited(!teamCountLimited)}
          />
          <FormField label="Maximálny počet tímov" disabled={!teamCountLimited} name="maxTeams">
            <TextInput type="number" name="maxTeams" />
          </FormField>
          <CheckBox
            label="Obmedziť veľkosť tímu"
            checked={teamSizeLimited}
            onChange={() => setTeamSizeLimited(!teamSizeLimited)}
          />
          <FormField label="Maximálna veľkosť tímu" disabled={!teamSizeLimited} name="maxTeamSize">
            <TextInput type="number" name="maxTeamSize" />
          </FormField>
        </Grid>
        <CheckBox label="Registrácia Normálna" name="regNormalEnabled" color="status-critical" />
        <CheckBox
          label="Registrácia ClassPack"
          name="regClassPackEnabled"
          color="status-critical"
        />

        {regValidError && (
          <>
            <Text color="status-critical">{regValidError}</Text>
            <br />
          </>
        )}

        <FormField label="Popis" name="description">
          <TextArea rows={5} name="description" />
        </FormField>
        <FormField label="Podmienky" name="conditions">
          <TextArea rows={5} name="conditions" />
        </FormField>

        <Box direction="row" gap="medium" justify="end">
          <Button plain onClick={onClose} label="Zrušiť" hoverIndicator />
          <Button
            primary
            type="submit"
            label={!program ? 'Vytvoriť' : 'Uložiť'}
            disabled={!!regValidError}
          />
        </Box>
      </Form>
    </Modal>
  );
}
