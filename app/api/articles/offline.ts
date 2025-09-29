import { dbm } from '../../../lib/db/manager';
import { DatabaseManagerClient } from '../../../lib/db/client';
import { articles } from '../../../lib/db/schema';
import { eq, and, like, or } from 'drizzle-orm';
import {
  generateArticleId,
  validateArticleData,
  detectDuplicates,
  normaliseData,
  sanitiseData,
} from '../../../lib/components/utils';
import { getBaseUrl } from '../../../lib/platform';

export async function get(req: Request) {
  console.log('articles::GET');
  const url = new URL(req.url, getBaseUrl());
  const id = url.searchParams.get('id');
  const limit = parseInt(url.searchParams.get('limit') || '50');
  const offset = parseInt(url.searchParams.get('offset') || '0');
  const search = url.searchParams.get('search') || '';

  await dbm.ensureDatabaseInitialised();
  const db = dbm.getLocal();

  if (id) {
    const result = await db.select().from(articles).where(eq(articles.id, id));
    const article = result[0] || null;
    console.log(article);
    return { success: true, data: article };
  }

  let all;
  if (search) {
    const s = `%${search.toLowerCase()}%`;
    all = await db
      .select()
      .from(articles)
      .where(
        or(
          like(articles.newsReportHeadline, s),
          like(articles.author, s),
          like(articles.notes, s),
        ),
      );
  } else {
    all = await db.select().from(articles);
  }
  const total = all.length;
  const data = all.slice(offset, offset + limit);
  return {
    success: true,
    data,
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    },
  };
}

export async function post(req: Request) {
  console.log('articles::post');
  const body = await req.json();
  const sanitisedData = sanitiseData(body);
  const normalisedData = normaliseData(sanitisedData);
  const validation = validateArticleData(normalisedData);
  if (!validation.isValid) {
    return {
      success: false,
      error: 'Validation failed',
      details: validation.errors,
    };
  }
  const id = generateArticleId(
    normalisedData.newsReportUrl || '',
    normalisedData.author || '',
    normalisedData.newsReportHeadline || '',
  );
  normalisedData.id = id;
  // Check for duplicates

  await dbm.ensureDatabaseInitialised();
  const db = dbm.getLocal();

  const existingArticles = await db.select().from(articles);
  const duplicates = detectDuplicates(normalisedData, existingArticles);
  if (duplicates.length > 0 && duplicates[0].confidence === 'high') {
    return {
      success: false,
      error: 'Potential duplicate article detected',
      duplicates: duplicates.slice(0, 3),
      id: duplicates[0].id,
    };
  }
  const articleData = {
    ...normalisedData,
    id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    syncStatus: 'pending',
  };
  await db.insert(articles).values(articleData);
  if (dbm instanceof DatabaseManagerClient)
    await dbm.addToSyncQueue('POST', '/api/articles', articleData);
  return {
    success: true,
    data: articleData,
    warnings: validation.warnings,
    duplicates: duplicates.length > 0 ? duplicates.slice(0, 3) : [],
  };
}

export async function put(req: Request) {
  const body = await req.json();
  if (!body.articleId) {
    return { success: false, error: 'Article ID is required' };
  }
  const sanitisedData = sanitiseData(body);
  const normalisedData = normaliseData(sanitisedData);
  const validation = validateArticleData(normalisedData);
  if (!validation.isValid) {
    return {
      success: false,
      error: 'Validation failed',
      details: validation.errors,
    };
  }

  await dbm.ensureDatabaseInitialised();
  const db = dbm.getLocal();

  const existingArr = await db
    .select()
    .from(articles)
    .where(eq(articles.id, body.articleId));
  const existing = existingArr[0];
  if (!existing) {
    return { success: false, error: 'Article not found' };
  }
  const updateData = {
    ...existing,
    ...normalisedData,
    updatedAt: new Date().toISOString(),
    syncStatus: 'pending',
  };
  delete updateData.articleId;
  delete updateData.createdAt;
  await db
    .update(articles)
    .set(updateData)
    .where(eq(articles.id, body.articleId));
  if (dbm instanceof DatabaseManagerClient)
    await dbm.addToSyncQueue('PUT', '/api/articles', updateData);
  return {
    success: true,
    data: updateData,
    warnings: validation.warnings,
  };
}

export async function del(req: Request) {
  const url = new URL(req.url, getBaseUrl());
  const articleId = url.searchParams.get('articleId');
  if (!articleId) {
    return { success: false, error: 'Article ID is required' };
  }

  await dbm.ensureDatabaseInitialised();
  const db = dbm.getLocal();

  const existingArr = await db
    .select()
    .from(articles)
    .where(eq(articles.id, articleId));
  const existing = existingArr[0];
  if (!existing) {
    return { success: false, error: 'Article not found' };
  }
  await db.delete(articles).where(eq(articles.id, articleId));
  if (dbm instanceof DatabaseManagerClient)
    await dbm.addToSyncQueue('DELETE', `/api/articles?articleId=${articleId}`);
  // Note: cascade delete for victims/perpetrators would require additional logic
  return {
    success: true,
    message: 'Article deleted successfully',
  };
}
