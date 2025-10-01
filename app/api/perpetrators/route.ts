import { NextResponse } from 'next/server';
import { and, eq, like, sql, type SQL } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { dbm, DatabaseManagerServer } from '../../../lib/db/server';
import {
  perpetrators,
  type Perpetrator,
  type NewPerpetrator,
} from '../../../lib/db/schema';
import { preparePerpetratorPayload } from '../../../lib/utils/transformers';
import { coercePerpetrator } from './utils';

const ensureServerDatabase = async () => {
  if (!(dbm instanceof DatabaseManagerServer)) {
    throw new TypeError(
      'Online API called with local database manager. This endpoint must run in a server context.',
    );
  }
  await dbm.ensureDatabaseInitialised();
  return dbm.getLocal();
};

export async function GET(request: Request) {
  try {
    const db = await ensureServerDatabase();
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const articleId = url.searchParams.get('articleId') || '';
    const search = url.searchParams.get('search') || '';
    const parsedLimit = Number.parseInt(
      url.searchParams.get('limit') || '50',
      10,
    );
    const parsedOffset = Number.parseInt(
      url.searchParams.get('offset') || '0',
      10,
    );
    const limit = Number.isNaN(parsedLimit) ? 50 : parsedLimit;
    const offset = Number.isNaN(parsedOffset) ? 0 : parsedOffset;

    if (id) {
      const existing = await db
        .select()
        .from(perpetrators)
        .where(eq(perpetrators.id, id))
        .limit(1);
      return NextResponse.json({ success: true, data: existing[0] ?? null });
    }

    const whereConditions: SQL[] = [];

    if (articleId) {
      whereConditions.push(eq(perpetrators.articleId, articleId));
    }

    if (search) {
      const wildcard = `%${search}%`;
      const searchConditions = [
        like(perpetrators.perpetratorName, wildcard),
        like(perpetrators.perpetratorRelationshipToVictim, wildcard),
        like(perpetrators.sentence, wildcard),
      ];

      const [firstCondition, ...remaining] = searchConditions;
      if (firstCondition) {
        const combined = remaining.reduce<SQL>(
          (acc, condition) => sql`${acc} OR ${condition}`,
          firstCondition,
        );
        whereConditions.push(combined);
      }
    }

    const condition = (() => {
      if (whereConditions.length === 0) return undefined;
      if (whereConditions.length === 1) return whereConditions[0];
      return and(...whereConditions);
    })();

    const baseQuery = db.select().from(perpetrators);
    const data = condition
      ? await baseQuery.where(condition).limit(limit).offset(offset)
      : await baseQuery.limit(limit).offset(offset);

    const countColumn = sql<number>`count(*)`.as('count');
    const totalResult = condition
      ? await db
          .select({ count: countColumn })
          .from(perpetrators)
          .where(condition)
      : await db.select({ count: countColumn }).from(perpetrators);
    const total = totalResult[0]?.count ?? 0;

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Failed to fetch perpetrators:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve perpetrators',
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const db = await ensureServerDatabase();
    const payload = await request.json();
    const { data: perpetratorData, validation } =
      preparePerpetratorPayload(payload);

    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validation.errors,
          warnings: validation.warnings,
        },
        { status: 400 },
      );
    }

    const coerced = coercePerpetrator(perpetratorData);
    if (!coerced.articleId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Article ID is required',
          warnings: validation.warnings,
        },
        { status: 400 },
      );
    }

    const now = new Date().toISOString();
    const newPerpetrator: NewPerpetrator = {
      id: uuidv4(),
      ...coerced,
      createdAt: now,
      updatedAt: now,
      syncStatus: 'synced',
      failureCount: 0,
      lastSyncAt: now,
    };

    const inserted = await db
      .insert(perpetrators)
      .values(newPerpetrator)
      .returning();
    const created = inserted[0] as Perpetrator | undefined;

    return NextResponse.json(
      {
        success: true,
        data: created ?? newPerpetrator,
        message: 'Perpetrator created successfully',
        warnings: validation.warnings,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Failed to create perpetrator:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create perpetrator',
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const db = await ensureServerDatabase();
    const payload = await request.json();
    const { id } = payload ?? {};

    if (typeof id !== 'string' || !id) {
      return NextResponse.json(
        { success: false, error: 'Perpetrator ID is required' },
        { status: 400 },
      );
    }

    const { data: perpetratorData, validation } =
      preparePerpetratorPayload(payload);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validation.errors,
          warnings: validation.warnings,
        },
        { status: 400 },
      );
    }

    const existing = await db
      .select()
      .from(perpetrators)
      .where(eq(perpetrators.id, id))
      .limit(1);

    if (!existing[0]) {
      return NextResponse.json(
        { success: false, error: 'Perpetrator not found' },
        { status: 404 },
      );
    }

    const coercedUpdate = coercePerpetrator(perpetratorData, existing[0]);
    if (!coercedUpdate.articleId) {
      return NextResponse.json(
        { success: false, error: 'Article ID is required' },
        { status: 400 },
      );
    }

    const now = new Date().toISOString();
    const updated = await db
      .update(perpetrators)
      .set({
        ...coercedUpdate,
        updatedAt: now,
        syncStatus: 'synced',
        failureCount: existing[0].failureCount ?? 0,
        lastSyncAt: now,
      })
      .where(eq(perpetrators.id, id))
      .returning();

    const updatedPerpetrator = updated[0] as Perpetrator | undefined;

    return NextResponse.json({
      success: true,
      data: updatedPerpetrator ?? { ...existing[0], ...coercedUpdate },
      message: 'Perpetrator updated successfully',
      warnings: validation.warnings,
    });
  } catch (error) {
    console.error('Failed to update perpetrator:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update perpetrator',
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const db = await ensureServerDatabase();
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Perpetrator ID is required' },
        { status: 400 },
      );
    }

    const existing = await db
      .select()
      .from(perpetrators)
      .where(eq(perpetrators.id, id))
      .limit(1);

    if (!existing[0]) {
      return NextResponse.json(
        { success: false, error: 'Perpetrator not found' },
        { status: 404 },
      );
    }

    await db.delete(perpetrators).where(eq(perpetrators.id, id));

    return NextResponse.json({
      success: true,
      message: 'Perpetrator deleted successfully',
    });
  } catch (error) {
    console.error('Failed to delete perpetrator:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete perpetrator',
      },
      { status: 500 },
    );
  }
}
