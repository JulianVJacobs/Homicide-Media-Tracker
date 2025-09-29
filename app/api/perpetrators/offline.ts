import { dbm } from '../../../lib/db/manager';
import { perpetrators } from '../../../lib/db/schema';
import { eq, like, or } from 'drizzle-orm';
import {
  validatePerpetratorData,
  sanitiseData,
} from '../../../lib/components/utils';
import { getBaseUrl } from '../../../lib/platform';
import { DatabaseManagerClient } from '../../../lib/db/client';

export async function get(req: Request) {
  const url = new URL(req.url, getBaseUrl());
  const id = url.searchParams.get('id');
  const limit = parseInt(url.searchParams.get('limit') || '50');
  const offset = parseInt(url.searchParams.get('offset') || '0');
  const search = url.searchParams.get('search') || '';
  const articleId = url.searchParams.get('articleId') || '';

  await dbm.ensureDatabaseInitialised();
  const db = dbm.getLocal();

  if (id) {
    const result = await db
      .select()
      .from(perpetrators)
      .where(eq(perpetrators.id, id ?? ''));
    const perpetrator = result[0] || null;
    return { success: true, data: perpetrator };
  }

  let all;
  if (articleId) {
    all = await db
      .select()
      .from(perpetrators)
      .where(eq(perpetrators.articleId, articleId));
  } else if (search) {
    const s = `%${search.toLowerCase()}%`;
    all = await db
      .select()
      .from(perpetrators)
      .where(
        or(
          like(perpetrators.perpetratorName, s),
          like(perpetrators.perpetratorRelationshipToVictim, s),
          like(perpetrators.sentence, s),
        ),
      );
  } else {
    all = await db.select().from(perpetrators);
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
  const perpetratorData = await req.json();
  const validation = validatePerpetratorData(perpetratorData);
  if (!validation.isValid) {
    return {
      success: false,
      error: 'Validation failed',
      details: validation.errors,
      warnings: validation.warnings,
    };
  }
  const sanitisedData = sanitiseData(perpetratorData);
  const { v4: uuidv4 } = await import('uuid');
  const id = uuidv4();

  await dbm.ensureDatabaseInitialised();
  const db = dbm.getLocal();

  const newPerpetrator = {
    id,
    ...sanitisedData,
    syncStatus: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await db.insert(perpetrators).values(newPerpetrator);
  if (dbm instanceof DatabaseManagerClient)
    await dbm.addToSyncQueue('POST', '/api/perpetrators', newPerpetrator);
  return {
    success: true,
    data: newPerpetrator,
    message: 'Perpetrator created successfully',
    warnings: validation.warnings,
  };
}

export async function put(req: Request) {
  const { id, ...perpetratorData } = await req.json();
  if (!id) {
    return { success: false, error: 'Perpetrator ID is required' };
  }
  const validation = validatePerpetratorData(perpetratorData);
  if (!validation.isValid) {
    return {
      success: false,
      error: 'Validation failed',
      details: validation.errors,
      warnings: validation.warnings,
    };
  }
  const sanitisedData = sanitiseData(perpetratorData);

  await dbm.ensureDatabaseInitialised();
  const db = dbm.getLocal();

  const existingArr = await db
    .select()
    .from(perpetrators)
    .where(eq(perpetrators.id, id ?? ''));
  const existing = existingArr[0];
  if (!existing) {
    return { success: false, error: 'Perpetrator not found' };
  }
  const updatedPerpetrator = {
    ...existing,
    ...sanitisedData,
    updatedAt: new Date().toISOString(),
    syncStatus: 'pending',
  };
  await db
    .update(perpetrators)
    .set(updatedPerpetrator)
    .where(eq(perpetrators.id, id));
  if (dbm instanceof DatabaseManagerClient)
    await dbm.addToSyncQueue('PUT', '/api/perpetrators', updatedPerpetrator);
  return {
    success: true,
    data: updatedPerpetrator,
    message: 'Perpetrator updated successfully',
    warnings: validation.warnings,
  };
}

export async function del(req: Request) {
  const url = new URL(req.url, getBaseUrl());
  const id = url.searchParams.get('id');

  await dbm.ensureDatabaseInitialised();
  const db = dbm.getLocal();

  if (!id) {
    return { success: false, error: 'Perpetrator ID is required' };
  }
  const existingArr = await db
    .select()
    .from(perpetrators)
    .where(eq(perpetrators.id, id ?? ''));
  const existing = existingArr[0];
  if (!existing) {
    return { success: false, error: 'Perpetrator not found' };
  }
  await db.delete(perpetrators).where(eq(perpetrators.id, id));
  if (dbm instanceof DatabaseManagerClient)
    await dbm.addToSyncQueue('DELETE', `/api/perpetrators?id=${id}`);
  return {
    success: true,
    message: 'Perpetrator deleted successfully',
  };
}
