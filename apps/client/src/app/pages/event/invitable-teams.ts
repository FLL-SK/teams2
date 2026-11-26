export interface InvitableTeam {
  id: string;
  name: string;
  teamNo: string;
}

interface ProgramRegistrationLike {
  teamId: string;
  teamNo?: string | null;
  team?: { name: string } | null;
}

/**
 * Tímy registrované v programe, ktoré ešte nie sú pozvané na turnaj (bez duplicít, podľa názvu).
 * Vytiahnuté zo stránky turnaja, aby sa dalo otestovať (#294).
 */
export function getInvitableTeams(
  programRegistrations: ProgramRegistrationLike[] | null | undefined,
  invitedTeamsIds: string[] | null | undefined,
): InvitableTeam[] {
  const invited = new Set(invitedTeamsIds ?? []);
  const out: InvitableTeam[] = [];
  for (const r of programRegistrations ?? []) {
    if (!r.team || invited.has(r.teamId) || out.some((t) => t.id === r.teamId)) {
      continue;
    }
    out.push({ id: r.teamId, name: r.team.name, teamNo: r.teamNo ?? 'xxx' });
  }
  return out.sort((a, b) => a.name.localeCompare(b.name));
}
