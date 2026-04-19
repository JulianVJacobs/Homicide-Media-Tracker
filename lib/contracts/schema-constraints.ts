export const SCHEMA_CONSTRAINT_PROFILE_DEFAULT = 'default';

export const SCHEMA_CONSTRAINT_REQUIRED_FIELDS = {
  victim: [
    'victimName',
    'dateOfDeath',
    'placeOfDeathProvince',
    'genderOfVictim',
  ],
  perpetrator: ['perpetratorName'],
} as const;

export type ConstraintType = keyof typeof SCHEMA_CONSTRAINT_REQUIRED_FIELDS;

export const getDefaultRequiredFields = (type: ConstraintType): string[] => [
  ...SCHEMA_CONSTRAINT_REQUIRED_FIELDS[type],
];
