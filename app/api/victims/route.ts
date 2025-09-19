import { NextRequest, NextResponse } from 'next/server';
import { eq, like, or } from 'drizzle-orm';
import { databaseManager } from '../../../lib/database/connection';
import { validateVictimData, sanitiseData } from '../../../lib/database/utils';
import * as schema from '../../../lib/database/schema';

/**
 * GET /api/victims - Retrieve all victims
 */
export async function GET(request: NextRequest) {
  // Log output pipeline for debugging
  console.log('Victims GET: start');
  const { ensureDatabaseInitialized } = await import(
    '../../../lib/database/init'
  );
  await ensureDatabaseInitialized();
  try {
    const db = databaseManager.getLocal();

    // Get query parameters for filtering
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const search = url.searchParams.get('search') || '';
    const articleId = url.searchParams.get('articleId') || '';

    // Build query with search filter
    let victims;
    let total = 0;

    if (articleId) {
      // Get victims for specific article
      victims = await db
        .select()
        .from(schema.victims)
        .where(eq(schema.victims.articleId, articleId))
        .limit(limit)
        .offset(offset);

      const totalResult = await db
        .select({ count: schema.victims.id })
        .from(schema.victims)
        .where(eq(schema.victims.articleId, articleId));
      total = totalResult.length;
    } else if (search) {
      // Query with search filter
      victims = await db
        .select()
        .from(schema.victims)
        .where(
          or(
            like(schema.victims.victimName, `%${search}%`),
            like(schema.victims.placeOfDeathProvince, `%${search}%`),
            like(schema.victims.placeOfDeathTown, `%${search}%`),
            like(schema.victims.policeStation, `%${search}%`),
          ),
        )
        .limit(limit)
        .offset(offset);

      // Get total count for search results
      const totalResult = await db
        .select({ count: schema.victims.id })
        .from(schema.victims)
        .where(
          or(
            like(schema.victims.victimName, `%${search}%`),
            like(schema.victims.placeOfDeathProvince, `%${search}%`),
            like(schema.victims.placeOfDeathTown, `%${search}%`),
            like(schema.victims.policeStation, `%${search}%`),
          ),
        );
      total = totalResult.length;
    } else {
      // Query without search filter
      victims = await db
        .select()
        .from(schema.victims)
        .limit(limit)
        .offset(offset);

      // Get total count
      const totalResult = await db
        .select({ count: schema.victims.id })
        .from(schema.victims);
      total = totalResult.length;
    }

    return NextResponse.json({
      success: true,
      data: victims,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Failed to fetch victims:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve victims',
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/victims - Create new victim
 */
export async function POST(request: NextRequest) {
  // Log output pipeline for debugging
  console.log('Victims POST: start');
  const { ensureDatabaseInitialized } = await import(
    '../../../lib/database/init'
  );
  await ensureDatabaseInitialized();
  try {
    const victimData = await request.json();

    // Validate victim data
    const validation = validateVictimData(victimData);
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

    // Sanitize data
    const sanitizedData = sanitiseData(victimData);

    const db = databaseManager.getLocal();

    // Generate id (UUID)
    const { v4: uuidv4 } = await import('uuid');
    const id = uuidv4();
    // Create victim record
    const newVictim = await db
      .insert(schema.victims)
      .values({
        id,
        articleId: sanitizedData.articleId,
        victimName: sanitizedData.victimName,
        dateOfDeath: sanitizedData.dateOfDeath,
        placeOfDeathProvince: sanitizedData.placeOfDeathProvince,
        placeOfDeathTown: sanitizedData.placeOfDeathTown,
        typeOfLocation: sanitizedData.typeOfLocation,
        policeStation: sanitizedData.policeStation,
        sexualAssault: sanitizedData.sexualAssault,
        genderOfVictim: sanitizedData.genderOfVictim,
        raceOfVictim: sanitizedData.raceOfVictim,
        ageOfVictim: sanitizedData.ageOfVictim,
        ageRangeOfVictim: sanitizedData.ageRangeOfVictim,
        modeOfDeathSpecific: sanitizedData.modeOfDeathSpecific,
        modeOfDeathGeneral: sanitizedData.modeOfDeathGeneral,
        typeOfMurder: sanitizedData.typeOfMurder,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncStatus: 'pending',
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        data: newVictim[0],
        message: 'Victim created successfully',
        warnings: validation.warnings,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Failed to create victim:', error);

    // Type-safe error handling
    const isConstraintError =
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 'SQLITE_CONSTRAINT_FOREIGN_KEY';

    if (isConstraintError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid article ID - article does not exist',
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create victim' },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/victims - Update existing victim
 */
export async function PUT(request: NextRequest) {
  try {
    const { id, ...victimData } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Victim ID is required' },
        { status: 400 },
      );
    }

    // Validate victim data
    const validation = validateVictimData(victimData);
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

    // Sanitize data
    const sanitizedData = sanitiseData(victimData);

    const db = databaseManager.getLocal();

    // Update victim record
    const updatedVictim = await db
      .update(schema.victims)
      .set({
        ...sanitizedData,
        updatedAt: new Date().toISOString(),
        syncStatus: 'pending',
      })
      .where(eq(schema.victims.id, id))
      .returning();

    if (updatedVictim.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Victim not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedVictim[0],
      message: 'Victim updated successfully',
      warnings: validation.warnings,
    });
  } catch (error) {
    console.error('Failed to update victim:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update victim' },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/victims - Delete victim
 */
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Victim ID is required' },
        { status: 400 },
      );
    }

    const db = databaseManager.getLocal();

    // Delete victim record
    const deletedVictim = await db
      .delete(schema.victims)
      .where(eq(schema.victims.id, id))
      .returning();

    if (deletedVictim.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Victim not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Victim deleted successfully',
    });
  } catch (error) {
    console.error('Failed to delete victim:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete victim' },
      { status: 500 },
    );
  }
}
