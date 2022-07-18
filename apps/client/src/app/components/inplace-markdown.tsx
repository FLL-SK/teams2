import { Box, Markdown, TextArea } from 'grommet';
import React, { useState } from 'react';
import styled from 'styled-components';

interface InPlaceMarkdownProps {
  value: string;
  onSubmit: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  editing?: boolean;
}

const Container = styled(Box)`
  margin: 5px 0;
  width: 100%;
  height: 100%;
`;

export function InPlaceMarkdown(props: InPlaceMarkdownProps) {
  const { value, onSubmit, disabled, editing, placeholder } = props;

  const [valueState, setValueState] = useState(value);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValueState(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(valueState);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && event.shiftKey) {
      event.preventDefault();
      onSubmit(valueState);
    }
  };

  if (!editing) {
    return (
      <Container>
        <Markdown>{valueState}</Markdown>
      </Container>
    );
  }

  return (
    <Container>
      <form onSubmit={handleSubmit}>
        <TextArea
          value={valueState}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
        />
      </form>
    </Container>
  );
}
