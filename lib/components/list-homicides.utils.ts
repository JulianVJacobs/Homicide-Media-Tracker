import type { Perpetrator, Victim } from '../db/schema';

export type ParticipantType = 'victim' | 'perpetrator' | 'other';
export type ParticipantTypeFilter = 'all' | ParticipantType;
export type ParticipantTypeSort = 'none' | 'asc' | 'desc';

export const participantTypeOrder: Record<ParticipantType, number> = {
  victim: 0,
  perpetrator: 1,
  other: 2,
};

export const participantTypeBadge: Record<
  ParticipantType,
  'danger' | 'primary' | 'secondary'
> = {
  victim: 'danger',
  perpetrator: 'primary',
  other: 'secondary',
};

export const participantTypeLabel: Record<ParticipantType, string> = {
  victim: 'Victim',
  perpetrator: 'Perpetrator',
  other: 'Other',
};

export interface CaseParticipants {
  victims: Victim[];
  perpetrators: Perpetrator[];
}

export const getCaseParticipantTypes = (
  case_: CaseParticipants,
): ParticipantType[] => {
  const hasVictims = Array.isArray(case_.victims) && case_.victims.length > 0;
  const hasPerpetrators =
    Array.isArray(case_.perpetrators) && case_.perpetrators.length > 0;

  if (!hasVictims && !hasPerpetrators) {
    return ['other'];
  }

  const result: ParticipantType[] = [];
  if (hasVictims) result.push('victim');
  if (hasPerpetrators) result.push('perpetrator');
  return result;
};

export const matchesParticipantTypeFilter = (
  case_: CaseParticipants,
  participantTypeFilter: ParticipantTypeFilter,
): boolean => {
  if (participantTypeFilter === 'all') {
    return true;
  }
  return getCaseParticipantTypes(case_).includes(participantTypeFilter);
};

export const compareCasesByParticipantType = (
  a: CaseParticipants,
  b: CaseParticipants,
  participantTypeSort: ParticipantTypeSort,
): number => {
  if (participantTypeSort === 'none') {
    return 0;
  }
  const aOrder = Math.min(
    ...getCaseParticipantTypes(a).map((type) => participantTypeOrder[type]),
  );
  const bOrder = Math.min(
    ...getCaseParticipantTypes(b).map((type) => participantTypeOrder[type]),
  );
  return participantTypeSort === 'asc' ? aOrder - bOrder : bOrder - aOrder;
};
