import React from 'react';
import { Avatar as GrommetAvatar, Text } from 'grommet';

interface AvatarProps {
  name?: string;
  username?: string;
  size?: 'small' | 'medium' | 'large';
}

export function Avatar({ username, name, size }: AvatarProps) {
  const n =
    username || name
      ? `${name ?? ''} ${username ?? ''}`
          .toLocaleUpperCase()
          .split(/\s+|[.@]/)
          .filter((w) => w.length > 0)
      : ['X', 'Y'];
  return (
    <GrommetAvatar background="accent-2" size={size}>
      <Text size={size} color="white">
        {n[0][0]}
        {n[1][0]}
      </Text>
    </GrommetAvatar>
  );
}
