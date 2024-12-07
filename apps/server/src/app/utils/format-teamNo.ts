export const formatTeamNo = (teamNo: number) => {
  return teamNo.toString().padStart(3, '0');
};
