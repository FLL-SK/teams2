import { Box } from 'grommet';
import React from 'react';
import { useGetSettingsQuery } from '../_generated/graphql';

interface LogoProps {
  width?: string;
  height?: string;
}

export const Logo = (props: LogoProps) => {
  const { height, width } = props;
  const { data } = useGetSettingsQuery();

  const url = data?.getSettings?.appLogoUrl ?? '';

  return (
    <Box height={{ max: height }} width={{ max: width }}>
      {url.length > 0 ? (
        <img src={url} width={width} alt="logo" />
      ) : (
        <Box width={width} height={height} border={{ side: 'all' }}>
          <Box margin="auto" width={{ max: '90%' }}>
            Logo nie je nastavené
          </Box>
        </Box>
      )}
    </Box>
  );
};
