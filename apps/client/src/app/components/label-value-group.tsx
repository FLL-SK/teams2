import { Box } from 'grommet';
import { DirectionType, GapType } from 'grommet/utils';
import React, { createContext, ReactNode } from 'react';

interface LabelValueGroupProps {
  labelWidth?: string;
  direction?: DirectionType;
  children?: ReactNode;
  gap?: GapType;
}

interface LabelValueGroupContextData {
  labelWidth?: string;
  direction?: DirectionType;
  gap?: GapType;
}

const emptyContext: LabelValueGroupContextData = {
  labelWidth: '100px',
  direction: 'column',
  gap: 'small',
};

export const LabelValueGroupContext = createContext<LabelValueGroupContextData>(emptyContext);
LabelValueGroupContext.displayName = 'LabelValueGroupContext';

export function LabelValueGroup(props: LabelValueGroupProps) {
  const { direction = 'column', labelWidth = '100px', children, gap } = props;
  return (
    <LabelValueGroupContext.Provider value={{ labelWidth, direction, gap }}>
      <Box gap={gap}>{children}</Box>
    </LabelValueGroupContext.Provider>
  );
}
