import { createGlobalStyle } from 'styled-components';
import { getColor } from './theme';

export const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
  }

  a {
    color: ${getColor('brandDarker')};
    &:hover {
      color: ${getColor('brand')};
      
    }
  }

`;
