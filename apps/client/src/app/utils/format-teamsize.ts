import { Registration } from '../generated/graphql';

export const formatTeamSize = ({
  boyCount,
  girlCount,
  coachCount,
}: Pick<Registration, 'boyCount' | 'girlCount' | 'coachCount'>) =>
  `${girlCount + boyCount}/${coachCount}`;
