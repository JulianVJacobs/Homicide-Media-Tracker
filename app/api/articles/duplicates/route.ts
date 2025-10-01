import { NextRequest, NextResponse } from 'next/server';
import { dbm, DatabaseManagerServer } from '../../../../lib/db/server';
import { detectDuplicates } from '../../../../lib/components/utils';
import * as schema from '../../../../lib/db/schema';

/**
 * POST /api/articles/duplicates - Detect duplicate articles
 */
export async function POST(request: NextRequest) {
  try {
    const articleData = await request.json();

    if (
      !articleData.newsReportUrl ||
      !articleData.newsReportHeadline ||
      !articleData.author
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            'URL, headline, and author are required for duplicate detection',
        },
        { status: 400 },
      );
    }
    if (!(dbm instanceof DatabaseManagerServer))
      throw new TypeError(
        'Online API called with local database manager. This endpoint must run in a server context.',
      );
    await dbm.ensureDatabaseInitialised();
    const db = dbm.getLocal();

    // Get all existing articles for comparison
    const existingArticles = await db.select().from(schema.articles);

    // Detect potential duplicates
    const duplicates = detectDuplicates(articleData, existingArticles);

    return NextResponse.json({
      success: true,
      data: {
        hasDuplicates: duplicates.length > 0,
        duplicateCount: duplicates.length,
        matches: duplicates,
      },
    });
  } catch (error) {
    console.error('Failed to detect duplicates:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to detect duplicates',
      },
      { status: 500 },
    );
  }
}

/**
 * GET /api/articles/duplicates - Get articles with potential duplicates
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const threshold = parseFloat(url.searchParams.get('threshold') || '0.7');
    if (!(dbm instanceof DatabaseManagerServer))
      throw new TypeError(
        'Online API called with local database manager. This endpoint must run in a server context.',
      );
    await dbm.ensureDatabaseInitialised();
    const db = dbm.getLocal();

    // Get all articles
    const articles = await db.select().from(schema.articles);

    const duplicateGroups = [];
    const processed = new Set();

    for (let i = 0; i < articles.length; i++) {
      if (processed.has(articles[i].id)) continue;

      const currentArticle = articles[i];
      const remainingArticles = articles.slice(i + 1);

      const duplicates = detectDuplicates(currentArticle, remainingArticles);
      const highConfidenceMatches = duplicates.filter(
        (match) => match.similarity >= threshold,
      );

      if (highConfidenceMatches.length > 0) {
        const group = {
          primary: currentArticle,
          duplicates: highConfidenceMatches,
        };

        duplicateGroups.push(group);

        // Mark all articles in this group as processed
        processed.add(currentArticle.id);
        highConfidenceMatches.forEach((match) => {
          const matchedArticle = articles.find(
            (a: schema.Article) => a.id === match.id,
          );
          if (matchedArticle) {
            processed.add(matchedArticle.id);
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        threshold,
        duplicateGroups,
        totalGroups: duplicateGroups.length,
        totalArticles: articles.length,
      },
    });
  } catch (error) {
    console.error('Failed to get duplicate articles:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve duplicate articles',
      },
      { status: 500 },
    );
  }
}
