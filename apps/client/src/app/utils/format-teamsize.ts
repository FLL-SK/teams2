export const formatTeamSize = ({
  boyCount,
  girlCount,
  coachCount,
}: {
  boyCount: number;
  girlCount: number;
  coachCount: number;
}) => `${girlCount + boyCount}/${coachCount}`;
