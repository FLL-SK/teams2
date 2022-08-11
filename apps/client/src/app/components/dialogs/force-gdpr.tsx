import { isNil, omitBy } from 'lodash';
import React from 'react';
import {
  UpdateUserInput,
  useDeclineGdprMutation,
  useUpdateUserMutation,
} from '../../generated/graphql';
import { useAppUser } from '../app-user/use-app-user';
import { useAuthenticate } from '../auth/useAuthenticate';
import { EditUserDialog, EditUserDialogFields } from './edit-user-dialog';

interface ForceGdprDialogProps {
  show?: boolean;
}

export function ForceGdprDialog(props: ForceGdprDialogProps) {
  const { user } = useAppUser();
  const { logout } = useAuthenticate();

  const [updateUser] = useUpdateUserMutation();
  const [declineGdpr] = useDeclineGdprMutation();

  if (!user || !!user.gdprAcceptedOn) {
    return null;
  }

  const handleDecline = async () => {
    await declineGdpr({ variables: { id: user.id } });
    logout();
  };

  const handleSubmit = async (data: EditUserDialogFields) => {
    const input: UpdateUserInput = {
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      username: data.username,
      usernameOverride: data.usernameOverride,
      gdprAccepted: data.gdprAccepted,
    };
    return updateUser({ variables: { id: user.id, input: omitBy(input, isNil) } });
  };

  return (
    <EditUserDialog
      user={user}
      onClose={handleDecline}
      onSubmit={handleSubmit}
      requestGdprConsent={!user.gdprAcceptedOn}
    />
  );
}
