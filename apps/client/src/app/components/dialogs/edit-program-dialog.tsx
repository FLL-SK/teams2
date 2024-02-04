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
  classPackEnabled?: boolean;
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
      classPackEnabled: program?.classPackEnabled ?? false,
    });
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
      classPackEnabled: value.classPackEnabled ?? false,
    };
    await onSubmit(result);
    onClose();
  };

  return (
    <Modal
      title={!program ? 'Nový program' : 'Detaily programu'}
      onClose={onClose}
      width="large"
      height="auto"
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
          <CheckBox label="Povoliť ClassPack" name="classPackEnabled" />
          <br />
          <CheckBox
            label="Obmedziť počet tímov"
            checked={teamCountLimited}
            onChange={() => setTeamCountLimited(!teamCountLimited)}
          />
          <FormField label="Maximálny počet tímov" disabled={!teamCountLimited} name="maxTeams">
            <TextInput type="number" name="maxTeams" />
          </FormField>
          <CheckBox
            label="Obmedziť veľkosť tímu tímov"
            checked={teamSizeLimited}
            onChange={() => setTeamSizeLimited(!teamSizeLimited)}
          />
          <FormField label="Maximálna veľkosť tímu" disabled={!teamSizeLimited} name="maxTeamSize">
            <TextInput type="number" name="maxTeamSize" />
          </FormField>
        </Grid>

        <FormField label="Popis" name="description">
          <TextArea rows={5} name="description" />
        </FormField>
        <FormField label="Podmienky" name="conditions">
          <TextArea rows={5} name="conditions" />
        </FormField>

        <Box direction="row" gap="medium" justify="end">
          <Button plain onClick={onClose} label="Zrušiť" hoverIndicator />
          <Button primary type="submit" label={!program ? 'Vytvoriť' : 'Uložiť'} />
        </Box>
      </Form>
    </Modal>
  );
}
