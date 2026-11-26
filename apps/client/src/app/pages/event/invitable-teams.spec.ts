import { getInvitableTeams } from './invitable-teams';

describe('getInvitableTeams (#294)', () => {
  const regs = [
    { teamId: 't2', teamNo: '002', team: { name: 'Beta' } },
    { teamId: 't1', teamNo: '001', team: { name: 'Alfa' } },
    { teamId: 't1', teamNo: '001', team: { name: 'Alfa' } }, // duplicita
    { teamId: 't3', teamNo: null, team: { name: 'Gama' } },
    { teamId: 't4', teamNo: '004', team: null },
  ];

  it('vráti nepozvané tímy bez duplicít, zoradené podľa názvu', () => {
    expect(getInvitableTeams(regs, [])).toEqual([
      { id: 't1', name: 'Alfa', teamNo: '001' },
      { id: 't2', name: 'Beta', teamNo: '002' },
      { id: 't3', name: 'Gama', teamNo: 'xxx' },
    ]);
  });

  it('po pozvaní tímu ho vynechá', () => {
    expect(getInvitableTeams(regs, ['t1']).map((t) => t.id)).toEqual(['t2', 't3']);
  });

  it('bez registrácií vráti prázdny zoznam', () => {
    expect(getInvitableTeams(undefined, ['t1'])).toEqual([]);
  });
});
