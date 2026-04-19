import { and, eq } from 'drizzle-orm';
import {
  SCHEMA_CONSTRAINT_PROFILE_DEFAULT,
  type ConstraintType,
  getDefaultRequiredFields,
} from '../contracts/schema-constraints';
import { schemaConstraints } from './schema';

type LoadedSchemaConstraint = {
  profileId: string;
  type: ConstraintType;
  requiredFields: string[];
};

const sanitiseRequiredFields = (
  fields: unknown,
  fallbackType: ConstraintType,
): string[] => {
  if (!Array.isArray(fields)) {
    return getDefaultRequiredFields(fallbackType);
  }

  const normalised = fields.filter(
    (field): field is string => typeof field === 'string' && field.trim() !== '',
  );

  if (normalised.length === 0) {
    return getDefaultRequiredFields(fallbackType);
  }

  return normalised;
};

const mapConstraint = (
  constraint: { profileId: string; requiredFields: unknown } | undefined,
  fallbackType: ConstraintType,
): LoadedSchemaConstraint | null => {
  if (!constraint) {
    return null;
  }

  return {
    profileId: constraint.profileId,
    type: fallbackType,
    requiredFields: sanitiseRequiredFields(
      constraint.requiredFields,
      fallbackType,
    ),
  };
};

export const loadSchemaConstraints = async (
  db: {
    select: () => {
      from: (table: typeof schemaConstraints) => {
        where: (condition: unknown) => {
          limit: (
            count: number,
          ) => Promise<Array<{ profileId: string; requiredFields: unknown }>>;
        };
      };
    };
  },
  profileId: string,
  type: ConstraintType,
): Promise<LoadedSchemaConstraint> => {
  const requested = await db
    .select()
    .from(schemaConstraints)
    .where(
      and(
        eq(schemaConstraints.profileId, profileId),
        eq(schemaConstraints.type, type),
      ),
    )
    .limit(1);
  const profileMatch = mapConstraint(requested[0], type);
  if (profileMatch) {
    return profileMatch;
  }

  const defaults = await db
    .select()
    .from(schemaConstraints)
    .where(
      and(
        eq(schemaConstraints.profileId, SCHEMA_CONSTRAINT_PROFILE_DEFAULT),
        eq(schemaConstraints.type, type),
      ),
    )
    .limit(1);
  const defaultMatch = mapConstraint(defaults[0], type);
  if (defaultMatch) {
    return defaultMatch;
  }

  return {
    profileId: SCHEMA_CONSTRAINT_PROFILE_DEFAULT,
    type,
    requiredFields: getDefaultRequiredFields(type),
  };
};
