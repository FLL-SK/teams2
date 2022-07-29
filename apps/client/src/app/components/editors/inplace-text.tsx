import { Anchor, Box, Text, TextInput } from 'grommet';
import React from 'react';

interface InplaceTextEditProps {
  value?: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  validate?: (value: string) => string;
}

export function InplaceTextEdit(props: InplaceTextEditProps) {
  const { value: inputValue, onChange, placeholder, disabled, validate } = props;
  const [edit, setEdit] = React.useState(false);
  const [error, setError] = React.useState<string>();
  const [value, setValue] = React.useState(inputValue ?? '');

  const onChangeValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const onValidate = () => {
    let ok = false;
    if (validate) {
      const error = validate(value);
      if (error.length > 0) {
        setError(error);
      } else {
        setError(undefined);
        ok = true;
      }
    } else {
      ok = true;
    }
    if (ok) {
      setEdit(false);
      onChange(value);
    }
  };

  const onBlur = () => onValidate();

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onBlur();
    }
    if (e.key === 'Escape') {
      setEdit(false);
      setValue(inputValue ?? '');
    }
  };

  return (
    <Box width="100%">
      <Box>
        {!edit && (
          <Box direction="row" align="center" justify="between" width="100%" hoverIndicator={!edit}>
            <Text onClick={() => setEdit(true)}>{value ?? placeholder}</Text>
            <Anchor label="Zmeniť" size="small" onClick={() => setEdit(true)} />
          </Box>
        )}

        {edit && (
          <TextInput
            autoFocus
            value={value}
            onChange={onChangeValue}
            onBlur={onBlur}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            disabled={disabled}
          />
        )}
      </Box>
      {error && <Text color="status-error">{error}</Text>}
    </Box>
  );
}
