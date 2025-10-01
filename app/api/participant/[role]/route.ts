import { NextRequest, NextResponse } from 'next/server';
import { dbm, DatabaseManagerServer } from '../../../../lib/db/server';
import * as schema from '../../../../lib/db/schema';

type ParticipantTable =
  | typeof schema.victims
  | typeof schema.perpetrators
  | typeof schema.participants;

// Dynamic participant API route by role
export async function GET(
  request: NextRequest,
  { params }: { params: { role: string } },
) {
  if (!(dbm instanceof DatabaseManagerServer))
    throw new TypeError(
      'Online API called with local database manager. This endpoint must run in a server context.',
    );
  await dbm.ensureDatabaseInitialised();
  const db = dbm.getLocal();
  const role = params.role;

  // Generalised: use schema[role] if defined, else fallback to participants table
  const roleTableMap: Record<string, ParticipantTable> = {
    victim: schema.victims,
    perpetrator: schema.perpetrators,
    participant: schema.participants,
  };
  const table: ParticipantTable = roleTableMap[role] || schema.participants;
  const participants = (await db.select().from(table)) as Array<
    schema.Participant | schema.Victim | schema.Perpetrator
  >;
  // Always include id and role in response
  return NextResponse.json({
    success: true,
    data: participants.map((p) => ({
      ...(p as Record<string, unknown>),
      role:
        'role' in p && typeof (p as { role?: unknown }).role === 'string'
          ? (p as { role: string }).role
          : role,
    })),
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { role: string } },
) {
  if (!(dbm instanceof DatabaseManagerServer))
    throw new TypeError(
      'Online API called with local database manager. This endpoint must run in a server context.',
    );
  await dbm.ensureDatabaseInitialised();
  const db = dbm.getLocal();
  const role = params.role;
  const body = await request.json();

  const roleTableMap: Record<string, ParticipantTable> = {
    victim: schema.victims,
    perpetrator: schema.perpetrators,
    participant: schema.participants,
  };
  const table: ParticipantTable = roleTableMap[role] || schema.participants;
  const result = (await db.insert(table).values(body).returning()) as Array<
    schema.Participant | schema.Victim | schema.Perpetrator
  >;
  // Handle both array and ResultSet cases
  const participantRecord = Array.isArray(result) ? result[0] : null;
  const inserted = participantRecord
    ? {
        ...(participantRecord as Record<string, unknown>),
        role:
          'role' in participantRecord &&
          typeof (participantRecord as { role?: unknown }).role === 'string'
            ? (participantRecord as { role: string }).role
            : role,
      }
    : null;
  // Always include id and role in response
  return NextResponse.json({ success: true, data: inserted });
}
