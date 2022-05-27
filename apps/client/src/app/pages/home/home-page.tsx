import { Box } from 'grommet';
import { Link } from 'react-router-dom';

import { BasePage } from '../../components/base-page';

interface HomePageProps {
  responsiveSize?: string;
}

export function HomePage(props: HomePageProps) {
  return (
    <BasePage>
      <Box pad="medium">
        <h1>Home Page</h1>
        <Link to="/profile">Click here for protected profile.</Link>
      </Box>
    </BasePage>
  );
}
