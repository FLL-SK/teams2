import React from 'react';
import { appPath } from '@teams2/common';
import { Button } from 'grommet';
import { Add } from 'grommet-icons';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SelectUser } from './select-user';
import { Tag } from './tag';

interface UserTagsProps {
  users: UserData[];
  onAdd?: (id: string) => Promise<unknown>;
  onRemove?: (id: string) => Promise<unknown>;
  labelAdd?: string;
  canEdit?: boolean;
}

interface UserData {
  id: string;
  username: string;
  name?: string;
}

export function UserTags(props: UserTagsProps) {
  const navigate = useNavigate();
  const { users, onAdd, onRemove, labelAdd, canEdit } = props;
  const [isAdding, setIsAdding] = useState(false);

  return (
    <>
      {users.map((m) => (
        <Tag
          key={m.id}
          value={m.username}
          onRemove={() => canEdit && onRemove && onRemove(m.id)}
          onClick={() => navigate(appPath.profile(m.id))}
        />
      ))}

      {isAdding ? (
        <SelectUser
          onClose={() => setIsAdding(false)}
          onSelect={(user) => onAdd && onAdd(user.id)}
        />
      ) : (
        <Button
          plain
          icon={<Add />}
          label={labelAdd ?? 'Pridať'}
          onClick={() => setIsAdding(true)}
          disabled={!canEdit}
        />
      )}
    </>
  );
}
