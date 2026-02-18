/**
 * Match rewards: base limit + bonus per successful invite.
 * Single source of truth; must match backend (get_effective_match_limit).
 */

export const BASE_MATCH_LIMIT = 10;
export const BONUS_PER_INVITE = 3;
export const MAX_BONUS_INVITES = 10;

/**
 * Total match limit for this drop = base + bonus * min(inviteUses, MAX_BONUS_INVITES).
 */
export function getMatchLimit(inviteUses: number): number {
  const capped = Math.min(Math.max(0, Math.floor(inviteUses)), MAX_BONUS_INVITES);
  return BASE_MATCH_LIMIT + BONUS_PER_INVITE * capped;
}

export type InviteProgress = {
  inviteUsesCapped: number;
  extraMatches: number;
  totalMatches: number;
  nextThresholdText: string;
};

/**
 * For UI: progress toward next bonus, and copy for "next drop" total.
 */
export function getInviteProgress(inviteUses: number): InviteProgress {
  const inviteUsesCapped = Math.min(Math.max(0, Math.floor(inviteUses)), MAX_BONUS_INVITES);
  const extraMatches = BONUS_PER_INVITE * inviteUsesCapped;
  const totalMatches = BASE_MATCH_LIMIT + extraMatches;
  const nextThresholdText =
    inviteUsesCapped >= MAX_BONUS_INVITES
      ? "Max bonus reached"
      : `${inviteUsesCapped + 1} invite${inviteUsesCapped === 0 ? "" : "s"} = +${BONUS_PER_INVITE} more`;
  return { inviteUsesCapped, extraMatches, totalMatches, nextThresholdText };
}
