import { NextRequest, NextResponse } from 'next/server';
import { dbm, DatabaseManagerServer } from '../../../../lib/db/server';
import { detectDuplicates } from '../../../../lib/components/utils';
import * as schema from '../../../../lib/db/schema';
import { mapDuplicateMatchDtos } from '../utils';

type DuplicateRequestPayload = {
  newsReportUrl?: string;
  newsReportHeadline?: string;
  author?: string;
  victimName?: string;
  victimAlias?: string | string[];
  dateOfDeath?: string;
  placeOfDeathProvince?: string;
  placeOfDeathTown?: string;
  perpetratorName?: string;
  perpetratorAlias?: string | string[];
  victims?: schema.Victim[];
  perpetrators?: schema.Perpetrator[];
};

const toArray = <T>(value: unknown): T[] => (Array.isArray(value) ? value : []);

const buildDuplicateCandidate = (
  article: Partial<schema.Article> & DuplicateRequestPayload,
  victims: schema.Victim[],
  perpetrators: schema.Perpetrator[],
) => {
  const [firstVictim] = victims;
  const [firstPerpetrator] = perpetrators;
  const victimAliases = victims
    .map((victim) => victim.victimAlias)
    .filter((alias): alias is string => typeof alias === 'string' && alias.length > 0);
  const victimNamesAsAlias = victims
    .map((victim) => victim.victimName)
    .filter((name): name is string => typeof name === 'string' && name.length > 0);
  const perpetratorAliases = perpetrators
    .map((perpetrator) => perpetrator.perpetratorAlias)
    .filter((alias): alias is string => typeof alias === 'string' && alias.length > 0);
  const perpetratorNamesAsAlias = perpetrators
    .map((perpetrator) => perpetrator.perpetratorName)
    .filter((name): name is string => typeof name === 'string' && name.length > 0);

  return {
    ...article,
    victimName: article.victimName ?? firstVictim?.victimName,
    victimAlias: [
      ...(toArray<string>(article.victimAlias).length > 0
        ? toArray<string>(article.victimAlias)
        : article.victimAlias
          ? [article.victimAlias]
          : []),
      ...victimAliases,
      ...victimNamesAsAlias,
    ],
    dateOfDeath: article.dateOfDeath ?? firstVictim?.dateOfDeath,
    placeOfDeathProvince:
      article.placeOfDeathProvince ?? firstVictim?.placeOfDeathProvince,
    placeOfDeathTown: article.placeOfDeathTown ?? firstVictim?.placeOfDeathTown,
    perpetratorName: article.perpetratorName ?? firstPerpetrator?.perpetratorName,
    perpetratorAlias: [
      ...(toArray<string>(article.perpetratorAlias).length > 0
        ? toArray<string>(article.perpetratorAlias)
        : article.perpetratorAlias
          ? [article.perpetratorAlias]
          : []),
      ...perpetratorAliases,
      ...perpetratorNamesAsAlias,
    ],
    victims,
    perpetrators,
  };
};

/**
 * POST /api/articles/duplicates - Detect duplicate articles
 */
export async function POST(request: NextRequest) {
  try {
    const articleData = (await request.json()) as DuplicateRequestPayload;

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

    // Get all existing records for comparison
    const existingArticles = await db.select().from(schema.articles);
    const existingVictims = await db.select().from(schema.victims);
    const existingPerpetrators = await db.select().from(schema.perpetrators);

    const victimsByArticleId = new Map<string, schema.Victim[]>();
    existingVictims.forEach((victim) => {
      const grouped = victimsByArticleId.get(victim.articleId) ?? [];
      grouped.push(victim);
      victimsByArticleId.set(victim.articleId, grouped);
    });

    const perpetratorsByArticleId = new Map<string, schema.Perpetrator[]>();
    existingPerpetrators.forEach((perpetrator) => {
      const grouped = perpetratorsByArticleId.get(perpetrator.articleId) ?? [];
      grouped.push(perpetrator);
      perpetratorsByArticleId.set(perpetrator.articleId, grouped);
    });

    const existingCandidates = existingArticles.map((article) =>
      buildDuplicateCandidate(
        article,
        victimsByArticleId.get(article.id) ?? [],
        perpetratorsByArticleId.get(article.id) ?? [],
      ),
    );

    const requestVictims = toArray<schema.Victim>(articleData.victims);
    const requestPerpetrators = toArray<schema.Perpetrator>(articleData.perpetrators);
    const candidate = buildDuplicateCandidate(
      articleData,
      requestVictims,
      requestPerpetrators,
    );

    // Detect potential duplicates
    const duplicates = detectDuplicates(candidate, existingCandidates);
    const duplicateDtos = mapDuplicateMatchDtos(duplicates);

    return NextResponse.json({
      success: true,
      data: {
        hasDuplicates: duplicates.length > 0,
        duplicateCount: duplicates.length,
        matches: duplicateDtos,
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
      const highConfidenceDtos = mapDuplicateMatchDtos(highConfidenceMatches);

      if (highConfidenceDtos.length > 0) {
        const group = {
          primary: currentArticle,
          duplicates: highConfidenceDtos,
        };

        duplicateGroups.push(group);

        // Mark all articles in this group as processed
        processed.add(currentArticle.id);
        highConfidenceDtos.forEach((match) => {
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
