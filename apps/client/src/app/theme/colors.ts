import { ColorType } from 'grommet/utils';
import { TagColorType } from '../_generated/graphql';

const brandColor = '#4E96D9';

const brandDarkerColor = '#1B476E';
const brandLighterColor = '#C8DFF4';

const accentColors = ['#FFD54F', '#FF864F', '#81FCED', '#FFCA58'];
const neutralColors = ['#00873D', '#3D138D', '#00739D', '#A2423D'];
const statusColors: Record<string, string> = {
  critical: '#FF4040',
  error: '#FF4040',
  warning: '#FFAA15',
  ok: '#00C781',
  unknown: '#CCCCCC',
  disabled: '#CCCCCC',
};
const darkColors = ['#333333', '#555555', '#777777', '#999999', '#999999', '#999999'];
const lightColors = ['#F8F8F8', '#F2F2F2', '#EDEDED', '#DADADA', '#DADADA', '#DADADA'];
const focusColor = accentColors[0];
export const _colors = {
  brand: brandColor,
  brandDarker: brandDarkerColor,
  brandLighter: brandLighterColor,
  active: 'rgba(221, 221, 221, 0.5)',
  'background-back': {
    light: '#EDF1F5',
    dark: '#21242e',
  },
  'background-front': {
    light: '#C8DFF4',
    dark: '#31343e',
  },
  'background-contrast': {
    light: '#33333310',
    dark: '#FFFFFF18',
  },
  'active-background': 'background-contrast',
  'active-text': 'text-strong',
  black: '#000000',
  border: {
    dark: 'rgba(255, 255, 255, 0.33)',
    light: 'rgba(0, 0, 0, 0.33)',
  },
  control: {
    dark: 'accent-1',
    light: 'brand',
  },
  focus: focusColor,
  'graph-0': 'accent-1',
  'graph-1': 'neutral-1',
  'graph-2': 'neutral-2',
  'graph-3': 'neutral-3',
  'graph-4': 'neutral-4',
  placeholder: '#AAAAAA',
  selected: 'brand',
  text: {
    dark: '#f8f8f8',
    light: '#444444',
  },
  'text-strong': {
    dark: '#FFFFFF',
    light: '#000000',
  },
  'text-weak': {
    dark: '#CCCCCC',
    light: '#555555',
  },
  'text-xweak': {
    dark: '#BBBBBB',
    light: '#666666',
  },
  icon: {
    dark: '#f8f8f8',
    light: '#666666',
  },
  'selected-background': 'brand',
  'selected-text': 'text-strong',
  white: '#FFFFFF',
};

const colorArray = function colorArray(array: Array<string>, prefix: string) {
  return array.forEach(function (color, index) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    _colors[prefix + '-' + (index + 1)] = color;
  });
};

colorArray(accentColors, 'accent');
colorArray(darkColors, 'dark');
colorArray(lightColors, 'light');
colorArray(neutralColors, 'neutral');
Object.keys(statusColors).forEach(function (color) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  _colors['status-' + color] = statusColors[color];
});

type Colors = typeof _colors & {
  'accent-1'?: ColorType;
  'accent-2'?: ColorType;
  'accent-3'?: ColorType;
  'accent-4'?: ColorType;
  'background-back'?: ColorType;
  'background-contrast'?: ColorType;
  'background-front'?: ColorType;
  'neutral-1'?: ColorType;
  'neutral-2'?: ColorType;
  'neutral-3'?: ColorType;
  'neutral-4'?: ColorType;
  'dark-1'?: ColorType;
  'dark-2'?: ColorType;
  'dark-3'?: ColorType;
  'dark-4'?: ColorType;
  'dark-5'?: ColorType;
  'dark-6'?: ColorType;
  'light-1'?: ColorType;
  'light-2'?: ColorType;
  'light-3'?: ColorType;
  'light-4'?: ColorType;
  'light-5'?: ColorType;
  'light-6'?: ColorType;
  'status-critical'?: ColorType;
  'status-error'?: ColorType;
  'status-warning'?: ColorType;
  'status-ok'?: ColorType;
  'status-unknown'?: ColorType;
  'status-disabled'?: ColorType;
  'graph-0'?: ColorType;
  'graph-1'?: ColorType;
  'graph-2'?: ColorType;
  'graph-3'?: ColorType;
  'graph-4'?: ColorType;
  'graph-5'?: ColorType;
};

type ThemeColorPair = { light?: string; dark?: string };

export function getColor(colorName: keyof Colors, light = true) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const color = _colors[colorName];

  if (!color || !color.light) {
    return color;
  }
  const pair = color as ThemeColorPair;
  return light ? pair.light : pair.dark;
}

const tagColors: Record<TagColorType, { background: string; text: string }> = {
  TC1: { background: 'white', text: 'black' },
  TC2: { background: 'gray', text: 'white' },
  TC3: { background: 'limegreen', text: 'black' },
  TC4: { background: 'orange', text: 'black' },
  TC5: { background: 'red', text: 'white' },
  TC6: { background: 'purple', text: 'white' },
  TC7: { background: 'blue', text: 'white' },
  TC8: { background: 'navy', text: 'white' },
};

export const getTagColor = (color?: TagColorType | null) => (color ? tagColors[color] : undefined);
export const getTagColorCodes = (): TagColorType[] => Object.keys(tagColors) as TagColorType[];
