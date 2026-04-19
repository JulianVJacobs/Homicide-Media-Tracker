export const PARTICIPANT_FORM_CONTRACT_VERSION = '2026-04-19';

export type ParticipantType = 'victim' | 'perpetrator' | 'other';

export const PARTICIPANT_FORM_VISIBLE_FIELD_GROUPS: Record<
  ParticipantType,
  readonly string[]
> = {
  victim: ['coreIdentity', 'demographics', 'deathDetails', 'location'],
  perpetrator: ['coreIdentity', 'relationship', 'suspectStatus', 'conviction'],
  other: ['coreIdentity'],
} as const;

export const PARTICIPANT_FORM_CONTRACT = {
  version: PARTICIPANT_FORM_CONTRACT_VERSION,
  typeOptions: ['victim', 'perpetrator', 'other'] as const,
  visibleFieldGroups: PARTICIPANT_FORM_VISIBLE_FIELD_GROUPS,
} as const;
