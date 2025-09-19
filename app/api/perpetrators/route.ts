import { NextRequest, NextResponse } from 'next/server';
import { eq, like, or } from 'drizzle-orm';
import { databaseManager } from '../../../lib/database/connection';
import {
  validatePerpetratorData,
  sanitiseData,
} from '../../../lib/database/utils';
import * as schema from '../../../lib/database/schema';

/**
 * GET /api/perpetrators - Retrieve all perpetrators
 */
export async function GET(request: NextRequest) {
  // Log output pipeline for debugging
  console.log('Perpetrators GET: start');
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
    let perpetrators;
    let total = 0;

    if (articleId) {
      // Get perpetrators for specific article
      perpetrators = await db
        .select()
        .from(schema.perpetrators)
        .where(eq(schema.perpetrators.articleId, articleId))
        .limit(limit)
        .offset(offset);

      const totalResult = await db
        .select({ count: schema.perpetrators.id })
        .from(schema.perpetrators)
        .where(eq(schema.perpetrators.articleId, articleId));
      total = totalResult.length;
    } else if (search) {
      // Query with search filter
      perpetrators = await db
        .select()
        .from(schema.perpetrators)
        .where(
          or(
            like(schema.perpetrators.perpetratorName, `%${search}%`),
            like(
              schema.perpetrators.perpetratorRelationshipToVictim,
              `%${search}%`,
            ),
            like(schema.perpetrators.sentence, `%${search}%`),
          ),
        )
        .limit(limit)
        .offset(offset);

      // Get total count for search results
      const totalResult = await db
        .select({ count: schema.perpetrators.id })
        .from(schema.perpetrators)
        .where(
          or(
            like(schema.perpetrators.perpetratorName, `%${search}%`),
            like(
              schema.perpetrators.perpetratorRelationshipToVictim,
              `%${search}%`,
            ),
            like(schema.perpetrators.sentence, `%${search}%`),
          ),
        );
      total = totalResult.length;
    } else {
      // Query without search filter
      perpetrators = await db
        .select()
        .from(schema.perpetrators)
        .limit(limit)
        .offset(offset);

      // Get total count
      const totalResult = await db
        .select({ count: schema.perpetrators.id })
        .from(schema.perpetrators);
      total = totalResult.length;
    }

    return NextResponse.json({
      success: true,
      data: perpetrators,
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

/**
 * POST /api/perpetrators - Create new perpetrator
 */
export async function POST(request: NextRequest) {
  // Log output pipeline for debugging
  console.log('Perpetrators POST: start');
  const { ensureDatabaseInitialized } = await import(
    '../../../lib/database/init'
  );
  await ensureDatabaseInitialized();
  try {
    const perpetratorData = await request.json();

    // Validate perpetrator data
    const validation = validatePerpetratorData(perpetratorData);
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
    const sanitizedData = sanitiseData(perpetratorData);

    const db = databaseManager.getLocal();

    // Generate id (UUID)
    const { v4: uuidv4 } = await import('uuid');
    const id = uuidv4();
    // Create perpetrator record
    const newPerpetrator = await db
      .insert(schema.perpetrators)
      .values({
        id,
        articleId: sanitizedData.articleId,
        perpetratorName: sanitizedData.perpetratorName,
        perpetratorRelationshipToVictim:
          sanitizedData.perpetratorRelationshipToVictim,
        suspectIdentified: sanitizedData.suspectIdentified,
        suspectArrested: sanitizedData.suspectArrested,
        suspectCharged: sanitizedData.suspectCharged,
        conviction: sanitizedData.conviction,
        sentence: sanitizedData.sentence,
        syncStatus: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        data: newPerpetrator[0],
        message: 'Perpetrator created successfully',
        warnings: validation.warnings,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Failed to create perpetrator:', error);

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
      { success: false, error: 'Failed to create perpetrator' },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/perpetrators - Update existing perpetrator
 */
export async function PUT(request: NextRequest) {
  try {
    const { id, ...perpetratorData } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Perpetrator ID is required' },
        { status: 400 },
      );
    }

    // Validate perpetrator data
    const validation = validatePerpetratorData(perpetratorData);
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
    const sanitizedData = sanitiseData(perpetratorData);

    const db = databaseManager.getLocal();

    // Update perpetrator record
    const updatedPerpetrator = await db
      .update(schema.perpetrators)
      .set({
        ...sanitizedData,
        updatedAt: new Date().toISOString(),
        syncStatus: 'pending',
      })
      .where(eq(schema.perpetrators.id, id))
      .returning();

    if (updatedPerpetrator.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Perpetrator not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedPerpetrator[0],
      message: 'Perpetrator updated successfully',
      warnings: validation.warnings,
    });
  } catch (error) {
    console.error('Failed to update perpetrator:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update perpetrator' },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/perpetrators - Delete perpetrator
 */
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Perpetrator ID is required' },
        { status: 400 },
      );
    }

    const db = databaseManager.getLocal();

    // Delete perpetrator record
    const deletedPerpetrator = await db
      .delete(schema.perpetrators)
      .where(eq(schema.perpetrators.id, id))
      .returning();

    if (deletedPerpetrator.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Perpetrator not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Perpetrator deleted successfully',
    });
  } catch (error) {
    console.error('Failed to delete perpetrator:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete perpetrator' },
      { status: 500 },
    );
  }
}
