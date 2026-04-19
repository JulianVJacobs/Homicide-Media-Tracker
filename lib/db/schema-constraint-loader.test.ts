import { loadSchemaConstraints } from './schema-constraint-loader';

type ConstraintRow = { profileId: string; requiredFields: unknown };

const createMockDb = (responses: ConstraintRow[][]) => {
  const queue = [...responses];
  return {
    select: () => ({
      from: () => ({
        where: () => ({
          limit: async () => queue.shift() ?? [],
        }),
      }),
    }),
  };
};

describe('loadSchemaConstraints', () => {
  it('returns profile-specific constraints when available', async () => {
    const db = createMockDb([
      [{ profileId: 'user-1', requiredFields: ['victimName'] }],
    ]);

    const loaded = await loadSchemaConstraints(db, 'user-1', 'victim');

    expect(loaded).toEqual({
      profileId: 'user-1',
      type: 'victim',
      requiredFields: ['victimName'],
    });
  });

  it('falls back to default profile constraints when profile is missing', async () => {
    const db = createMockDb([
      [],
      [{ profileId: 'default', requiredFields: ['perpetratorName'] }],
    ]);

    const loaded = await loadSchemaConstraints(db, 'user-1', 'perpetrator');

    expect(loaded).toEqual({
      profileId: 'default',
      type: 'perpetrator',
      requiredFields: ['perpetratorName'],
    });
  });

  it('falls back to baked defaults when no rows exist', async () => {
    const db = createMockDb([[], []]);

    const loaded = await loadSchemaConstraints(db, 'user-1', 'victim');

    expect(loaded).toEqual({
      profileId: 'default',
      type: 'victim',
      requiredFields: [
        'victimName',
        'dateOfDeath',
        'placeOfDeathProvince',
        'genderOfVictim',
      ],
    });
  });

  it('uses baked defaults when stored required_fields payload is invalid', async () => {
    const db = createMockDb([
      [{ profileId: 'user-1', requiredFields: [] }],
    ]);

    const loaded = await loadSchemaConstraints(db, 'user-1', 'perpetrator');

    expect(loaded).toEqual({
      profileId: 'user-1',
      type: 'perpetrator',
      requiredFields: ['perpetratorName'],
    });
  });
});
