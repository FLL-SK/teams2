import { Box, Button, Markdown, TextArea } from 'grommet';
import React, { useState } from 'react';
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

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValueState(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(valueState ?? '');
    setEditing(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && event.shiftKey) {
      event.preventDefault();
      onSubmit(valueState ?? '');
      setEditing(false);
    }
    if (event.key === 'Escape') {
      setValueState(value);
      setEditing(false);
    }
  };

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
    </Container>
  );
}
