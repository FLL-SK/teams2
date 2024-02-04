import { useApolloClient } from '@apollo/client';
import { isNil, omitBy } from 'lodash';
import React from 'react';
import {
  UpdateUserInput,
  useDeclineGdprMutation,
  useUpdateUserMutation,
} from '../../_generated/graphql';
import { useAppUser } from '../app-user/use-app-user';
import { EditUserDialog, EditUserDialogFields } from './edit-user-dialog';
import { useAuthenticate } from '@teams2/auth-react';

interface ForceGdprDialogProps {
  show?: boolean;
}

export function ForceGdprDialog(props: ForceGdprDialogProps) {
  const { user } = useAppUser();
  const { logout } = useAuthenticate();
  const apolloClient = useApolloClient();

  const [updateUser] = useUpdateUserMutation();
  const [declineGdpr] = useDeclineGdprMutation();

  if (!user || !!user.gdprAcceptedOn) {
    return null;
  }

  const handleDecline = async () => {
    await declineGdpr({ variables: { id: user.id } });
    logout();
    apolloClient.clearStore();
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
