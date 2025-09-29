import { NextRequest, NextResponse } from 'next/server';
import { dbm } from '../../../../lib/db/manager';
import * as schema from '../../../../lib/db/schema';

// Dynamic participant API route by role
export async function GET(
  request: NextRequest,
  { params }: { params: { role: string } },
) {
  const db = dbm.getLocal();
  const role = params.role;

  // Generalised: use schema[role] if defined, else fallback to participants table
  const roleTableMap: Record<string, any> = {
    victim: schema.victims,
    perpetrator: schema.perpetrators,
    participant: schema.participants,
  };
  let participants = [];
  const table = roleTableMap[role] || schema.participants;
  participants = await db.select().from(table) as schema.Participant[];
  // Always include id and role in response
  return NextResponse.json({
    success: true,
    data: participants.map((p: schema.Participant) => ({ ...p, role: p.role ?? role })),
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { role: string } },
) {
  const db = dbm.getLocal();
  const role = params.role;
  const body = await request.json();

  const roleTableMap: Record<string, any> = {
    victim: schema.victims,
    perpetrator: schema.perpetrators,
    participant: schema.participants,
  };
  let inserted;
  const table = roleTableMap[role] || schema.participants;
  const result = await db.insert(table).values(body).returning();
  // Handle both array and ResultSet cases
  const participant = Array.isArray(result)
    ? result[0]
    : result && result.rows
      ? result.rows[0]
      : null;
  inserted = participant
    ? { ...participant, role: participant.role ?? role }
    : null;
  // Always include id and role in response
  return NextResponse.json({ success: true, data: inserted });
}
