import { ThemeType } from 'grommet';
import { EdgeSizeType, GapType } from 'grommet/utils';
import { css } from 'styled-components';
import { _colors, getColor } from './colors';

export { getColor } from './colors';

export type Density = 'high' | 'medium' | 'low';

export type InputBackgroundColor = 'dark' | 'light' | 'none';

export const breakpoints = {
  mobileS: '320px',
  tablet: '768px',
  laptop: '1024px',
  desktop: '1440px',
};

export const device = {
  mobileS: `(min-width: ${breakpoints.mobileS})`,
  tablet: `(min-width: ${breakpoints.tablet})`,
  laptop: `(min-width: ${breakpoints.laptop})`,
  desktopL: `(min-width: ${breakpoints.desktop})`,
};

export const margins: Record<EdgeSizeType, string> = {
  xxsmall: '2px',
  xsmall: '3px',
  small: '8px',
  medium: '12px',
  large: '16px',
  xlarge: '24px',
};

export const getMargin = (gap: GapType) => {
  if (gap === 'none') {
    return undefined;
  }
  if (gap in margins) {
    return margins[gap as EdgeSizeType];
  }
  return gap;
};

export const appLayout = {
  mainNav: {
    mobile: {
      height: '60px',
    },
    laptop: {
      width: '200px',
    },
    sidebar: {
      minWidth: '250px',
    },
  },
  contentPadding: {
    top: margins.large,
    bottom: margins.medium,
    left: margins.medium,
    right: margins.medium,
  },
  borderRadius: {
    small: '3px',
    normal: '8px',
    huge: '16px',
  },
};

export const defaultTheme: ThemeType = {
  global: {
    font: {
      family: "'Roboto', sans-serif;",
      size: '16px',
      height: '28px',
    },
    colors: _colors,
  },
  tabs: {
    extend: css`
      width: 100%;
      margin-top: ${margins.medium};
      border: 1px solid ${getColor('light-2')};
    `,
    header: {
      extend: css`
        align-self: start;
        justify-content: start;
        width: 100%;
        background-color: ${getColor('light-1')};
      `,
    },
    panel: {
      extend: css`
        padding: ${margins.medium} ${margins.small};
      `,
    },
  },
  formField: {
    border: {
      side: 'all',
    },
    round: {
      size: '4px',
    },
    error: {
      color: getColor('status-critical'),
    },
  },
  tip: {
    content: {
      background: 'light-1',
    },
  },
  textInput: {},
};
