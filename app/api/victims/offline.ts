import { dbm } from '../../../lib/db/manager';
import { victims } from '../../../lib/db/schema';
import { DatabaseManagerClient } from '../../../lib/db/client';
import { eq, like, or } from 'drizzle-orm';
import {
  validateVictimData,
  sanitiseData,
} from '../../../lib/components/utils';
import { getBaseUrl } from '../../../lib/platform';

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
      .from(victims)
      .where(eq(victims.id, id ?? ''));
    const victim = result[0] || null;
    return { success: true, data: victim };
  }

  let all;
  if (articleId) {
    all = await db
      .select()
      .from(victims)
      .where(eq(victims.articleId, articleId));
  } else if (search) {
    const s = `%${search.toLowerCase()}%`;
    all = await db
      .select()
      .from(victims)
      .where(
        or(
          like(victims.victimName, s),
          like(victims.placeOfDeathProvince, s),
          like(victims.placeOfDeathTown, s),
          like(victims.policeStation, s),
        ),
      );
  } else {
    all = await db.select().from(victims);
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
  const victimData = await req.json();
  const validation = validateVictimData(victimData);
  if (!validation.isValid) {
    return {
      success: false,
      error: 'Validation failed',
      details: validation.errors,
      warnings: validation.warnings,
    };
  }
  const sanitisedData = sanitiseData(victimData);
  const { v4: uuidv4 } = await import('uuid');
  const id = uuidv4();

  await dbm.ensureDatabaseInitialised();
  const db = dbm.getLocal();

  const newVictim = {
    id,
    ...sanitisedData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    syncStatus: 'pending',
  };
  await db.insert(victims).values(newVictim);
  if (dbm instanceof DatabaseManagerClient)
    await dbm.addToSyncQueue('POST', '/api/victims', newVictim);
  return {
    success: true,
    data: newVictim,
    message: 'Victim created successfully',
    warnings: validation.warnings,
  };
}

export async function put(req: Request) {
  const { id, ...victimData } = await req.json();
  if (!id) {
    return { success: false, error: 'Victim ID is required' };
  }
  const validation = validateVictimData(victimData);
  if (!validation.isValid) {
    return {
      success: false,
      error: 'Validation failed',
      details: validation.errors,
      warnings: validation.warnings,
    };
  }
  const sanitisedData = sanitiseData(victimData);

  await dbm.ensureDatabaseInitialised();
  const db = dbm.getLocal();

  const existingArr = await db
    .select()
    .from(victims)
    .where(eq(victims.id, id ?? ''));
  const existing = existingArr[0];
  if (!existing) {
    return { success: false, error: 'Victim not found' };
  }
  const updatedVictim = {
    ...existing,
    ...sanitisedData,
    updatedAt: new Date().toISOString(),
    syncStatus: 'pending',
  };
  await db.update(victims).set(updatedVictim).where(eq(victims.id, id));
  if (dbm instanceof DatabaseManagerClient)
    await dbm.addToSyncQueue('PUT', '/api/victims', updatedVictim);
  return {
    success: true,
    data: updatedVictim,
    message: 'Victim updated successfully',
    warnings: validation.warnings,
  };
}

// DELETE /api/victims (offline)
export async function del(req: Request) {
  const url = new URL(req.url, getBaseUrl());
  const id = url.searchParams.get('id');
  if (!id) {
    return { success: false, error: 'Victim ID is required' };
  }

  await dbm.ensureDatabaseInitialised();
  const db = dbm.getLocal();
  
  const existingArr = await db.select().from(victims).where(eq(victims.id, id));
  const existing = existingArr[0];
  if (!existing) {
    return { success: false, error: 'Victim not found' };
  }
  await db.delete(victims).where(eq(victims.id, id));
  if (dbm instanceof DatabaseManagerClient)
    await dbm.addToSyncQueue('DELETE', `/api/victims?id=${id}`);
  return {
    success: true,
    message: 'Victim deleted successfully',
  };
}
