import React from 'react';
import { Box, Text } from 'grommet';
import { ReactNode } from 'react';
import { LabelValueGroupContext } from './label-value-group';

interface LabelValueProps {
  label: string;
  labelWidth?: string;
  value?: string | null;
  direction?: 'row' | 'column';
  children?: ReactNode;
}

export const LabelValue = (props: LabelValueProps) => {
  const { label, value = '', direction, labelWidth, children } = props;
  return (
    <LabelValueGroupContext.Consumer>
      {(context) => {
        const dir = direction ?? context.direction;

        return (
          <Box direction={dir}>
            <Box width={labelWidth ?? context.labelWidth}>
              <Text weight="bold">{label}</Text>
            </Box>
            {typeof value === 'string' && <Text>{value}</Text>}
            {children}
          </Box>
        );
      }}
    </LabelValueGroupContext.Consumer>
  );
};
