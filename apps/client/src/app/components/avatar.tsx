import React from 'react';
import { User } from '../generated/graphql';
import { Avatar as GrommetAvatar, Text } from 'grommet';

interface AvatarProps {
  user?: Pick<User, 'id' | 'name' | 'username'> | null;
}

export function Avatar({ user }: AvatarProps) {
  const n = user ? (user.name ?? user.username).toLocaleUpperCase().split(/\s+|[.@]/) : ['X', 'Y'];
  return (
    <GrommetAvatar background="accent-2">
      <Text>
        {n[0]}
        {n[1]}
      </Text>
    </GrommetAvatar>
  );
}
