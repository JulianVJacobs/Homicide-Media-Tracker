import { NextRequest, NextResponse } from 'next/server';
import { eq, like, or } from 'drizzle-orm';
import { databaseManager } from '../../../lib/database/connection';
import {
  generateArticleId,
  validateArticleData,
  detectDuplicates,
  normaliseData,
  sanitiseData,
} from '../../../lib/database/utils';
import * as schema from '../../../lib/database/schema';

/**
 * GET /api/articles - Retrieve all articles
 */
export async function GET(request: NextRequest) {
  // Log output pipeline for debugging
  console.log('Articles GET: start');
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

    // Build query with search filter
    let articles;
    let total = 0;

    if (search) {
      // Query with search filter
      articles = await db
        .select()
        .from(schema.articles)
        .where(
          or(
            like(schema.articles.newsReportHeadline, `%${search}%`),
            like(schema.articles.author, `%${search}%`),
            like(schema.articles.notes, `%${search}%`),
          ),
        )
        .limit(limit)
        .offset(offset);

      // Get total count for search results
      const totalResult = await db
        .select({ count: schema.articles.id })
        .from(schema.articles)
        .where(
          or(
            like(schema.articles.newsReportHeadline, `%${search}%`),
            like(schema.articles.author, `%${search}%`),
            like(schema.articles.notes, `%${search}%`),
          ),
        );
      total = totalResult.length;
    } else {
      // Query without search filter
      articles = await db
        .select()
        .from(schema.articles)
        .limit(limit)
        .offset(offset);

      // Get total count
      const totalResult = await db
        .select({ count: schema.articles.id })
        .from(schema.articles);
      total = totalResult.length;
    }

    return NextResponse.json({
      success: true,
      data: articles,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Failed to fetch articles:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch articles' },
      { status: 500 },
    );
  }
}

/**
 * POST /api/articles - Create new article
 */
export async function POST(request: NextRequest) {
  // Log output pipeline for debugging
  console.log('Articles POST: start');
  const { ensureDatabaseInitialized } = await import(
    '../../../lib/database/init'
  );
  await ensureDatabaseInitialized();
  try {
    const body = await request.json();
    const db = databaseManager.getLocal();

    // Sanitize and normalize input data
    const sanitizedData = sanitiseData(body);
    const normalizedData = normaliseData(sanitizedData);

    // Validate article data
    const validation = validateArticleData(normalizedData);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validation.errors,
        },
        { status: 400 },
      );
    }

    // Generate article ID (PK)
    const id = generateArticleId(
      normalizedData.newsReportUrl || '',
      normalizedData.author || '',
      normalizedData.newsReportHeadline || '',
    );
    // Use as PK
    normalizedData.id = id;

    // Check for duplicates
    const existingArticles = await db.select().from(schema.articles);
    const duplicates = detectDuplicates(normalizedData, existingArticles);

    if (duplicates.length > 0 && duplicates[0].confidence === 'high') {
      return NextResponse.json(
        {
          success: false,
          error: 'Potential duplicate article detected',
          duplicates: duplicates.slice(0, 3), // Return top 3 matches
          id: duplicates[0].id,
        },
        { status: 409 },
      );
    }

    // Prepare article data
    const articleData = {
      ...normalizedData,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: 'pending',
    };

    // Insert article
    const [newArticle] = await db
      .insert(schema.articles)
      .values(articleData)
      .returning();

    return NextResponse.json(
      {
        success: true,
        data: newArticle,
        warnings: validation.warnings,
        duplicates: duplicates.length > 0 ? duplicates.slice(0, 3) : [],
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Failed to create article:', error);

    // Type-safe error handling
    const isConstraintError =
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 'SQLITE_CONSTRAINT_UNIQUE';

    if (isConstraintError) {
      return NextResponse.json(
        { success: false, error: 'Article already exists' },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create article' },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/articles - Update existing article
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const db = databaseManager.getLocal();

    if (!body.articleId) {
      return NextResponse.json(
        { success: false, error: 'Article ID is required' },
        { status: 400 },
      );
    }

    // Sanitize and normalize input data
    const sanitizedData = sanitiseData(body);
    const normalizedData = normaliseData(sanitizedData);

    // Validate article data
    const validation = validateArticleData(normalizedData);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validation.errors,
        },
        { status: 400 },
      );
    }

    // Prepare update data
    const updateData = {
      ...normalizedData,
      updatedAt: new Date().toISOString(),
      syncStatus: 'pending', // Mark for sync when updated
    };

    // Remove articleId from update data (shouldn't be changed)
    delete updateData.articleId;
    delete updateData.createdAt;

    // Update article
    const [updatedArticle] = await db
      .update(schema.articles)
      .set(updateData)
      .where(eq(schema.articles.id, body.articleId))
      .returning();

    if (!updatedArticle) {
      return NextResponse.json(
        { success: false, error: 'Article not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedArticle,
      warnings: validation.warnings,
    });
  } catch (error) {
    console.error('Failed to update article:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update article' },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/articles - Delete article (requires admin privileges)
 */
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const articleId = url.searchParams.get('articleId');

    if (!articleId) {
      return NextResponse.json(
        { success: false, error: 'Article ID is required' },
        { status: 400 },
      );
    }

    const db = databaseManager.getLocal();

    // Check if article exists
    const existingArticle = await db
      .select()
      .from(schema.articles)
      .where(eq(schema.articles.id, articleId))
      .limit(1);

    if (existingArticle.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Article not found' },
        { status: 404 },
      );
    }

    // Delete related victims and perpetrators first (cascade delete)
    await db
      .delete(schema.victims)
      .where(eq(schema.victims.articleId, articleId));

    await db
      .delete(schema.perpetrators)
      .where(eq(schema.perpetrators.articleId, articleId));

    // Delete the article
    await db
      .delete(schema.articles)
      .where(eq(schema.articles.id, articleId));

    return NextResponse.json({
      success: true,
      message: 'Article and related data deleted successfully',
    });
  } catch (error) {
    console.error('Failed to delete article:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete article' },
      { status: 500 },
    );
  }
}
