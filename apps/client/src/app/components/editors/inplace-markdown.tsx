import { Anchor, Box, Markdown, TextArea } from 'grommet';
import React, { useCallback, useState } from 'react';
import styled from 'styled-components';

interface InPlaceMarkdownProps {
  value?: string;
  onSubmit: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const Container = styled(Box)`
  margin: 5px 0;
  min-height: 12pt;
  min-width: 100px;
  width: 100%;
  height: 100%;
`;

export function InPlaceMarkdown(props: InPlaceMarkdownProps) {
  const { value, onSubmit, disabled, placeholder } = props;

  const [valueState, setValueState] = useState(value);
  const [editing, setEditing] = useState(false);

  const handleChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValueState(event.target.value);
  }, []);

  const doSubmit = useCallback(() => {
    onSubmit(valueState ?? '');
    setEditing(false);
  }, [valueState, onSubmit]);

  const doCancel = useCallback(() => {
    setValueState(value);
    setEditing(false);
  }, [value]);

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      doSubmit();
    },
    [doSubmit]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === 'Enter' && event.shiftKey) {
        event.preventDefault();
        doSubmit();
      }
      if (event.key === 'Escape') {
        doCancel();
      }
    },
    [doCancel, doSubmit]
  );

  if (!editing) {
    return (
      <Container onClick={() => setEditing(true)} hoverIndicator>
        <Markdown>{value ?? placeholder ?? 'kliknutím editovať'}</Markdown>
      </Container>
    );
  }

  return (
    <Container>
      <form onSubmit={handleSubmit}>
        <TextArea
          autoFocus
          value={valueState}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />
      </form>
      <Box direction="row" justify="end" gap="medium" pad="small">
        <Anchor size="small" onClick={() => doCancel()} label="Zrušiť" />
        <Anchor size="small" onClick={() => doSubmit()} label="Uložiť" />
      </Box>
    </Container>
  );
}
