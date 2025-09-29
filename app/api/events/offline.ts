import { dbm } from '../../../lib/db/manager';
import { events, type Event } from '../../../lib/db/schema';
import { eq } from 'drizzle-orm';
import { getBaseUrl } from '../../../lib/platform';
import { DatabaseManagerClient } from '../../../lib/db/client';

export async function get(req: Request) {
  const url = new URL(req.url, getBaseUrl());
  const id = url.searchParams.get('id');
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '10');
  const search = url.searchParams.get('search') || '';

  await dbm.ensureDatabaseInitialised();
  const db = dbm.getLocal();

  let all = await db.select().from(events);
  if (id) {
    const result = await db
      .select()
      .from(events)
      .where(eq(events.id, id ?? ''));
    const event = result[0] || null;
    return { success: true, data: event };
  }
  if (search) {
    const s = search.toLowerCase();
    all = all.filter((event: Event) => {
      const eventTypes = Array.isArray(event.eventTypes)
        ? event.eventTypes
        : typeof event.eventTypes === 'string'
          ? JSON.parse(event.eventTypes || '[]')
          : [];
      const details =
        typeof event.details === 'string'
          ? JSON.parse(event.details || '{}')
          : event.details;
      return (
        eventTypes.some((type: string) => type.toLowerCase().includes(s)) ||
        Object.values(details).some(
          (val) => typeof val === 'string' && val.toLowerCase().includes(s),
        )
      );
    });
  }
  const startIndex = (page - 1) * limit;
  const paginatedEvents = all.slice(startIndex, startIndex + limit);
  const total = all.length;
  return {
    success: true,
    data: {
      events: Array.isArray(paginatedEvents) ? paginatedEvents : [],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function post(req: Request) {
  const body = await req.json();
  if (
    !body.eventTypes ||
    !body.articleIds ||
    !body.participantIds ||
    !body.details
  ) {
    return {
      success: false,
      error: 'Missing required fields',
      message:
        'eventTypes, articleIds, participantIds, and details are required',
    };
  }
  const eventTypes = Array.isArray(body.eventTypes)
    ? body.eventTypes
    : JSON.parse(body.eventTypes);
  const details =
    typeof body.details === 'string' ? JSON.parse(body.details) : body.details;
  const { v4: uuidv4 } = await import('uuid');
  const id = body.eventId || uuidv4();

  await dbm.ensureDatabaseInitialised();
  const db = dbm.getLocal();

  const newEvent = {
    id,
    eventTypes,
    articleIds: body.articleIds,
    participantIds: body.participantIds,
    details,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await db.insert(events).values(newEvent);
  // Only call addToSyncQueue if available (client-side only)
  // This should never be called server-side; offline.ts is for client-side usage
  if (dbm instanceof DatabaseManagerClient)
    await (dbm as any).addToSyncQueue('POST', '/api/events', newEvent);

  return {
    success: true,
    data: newEvent,
    message: 'Event created successfully',
  };
}

export async function put(req: Request) {
  const body = await req.json();
  if (!body.id) {
    return { success: false, error: 'Event ID is required' };
  }

  await dbm.ensureDatabaseInitialised();
  const db = dbm.getLocal();

  const existingArr = await db
    .select()
    .from(events)
    .where(eq(events.id, body.id ?? ''));
  const existing = existingArr[0];
  if (!existing) {
    return { success: false, error: 'Event not found' };
  }
  const updatedEvent = {
    ...existing,
    ...body,
    updatedAt: new Date().toISOString(),
  };
  await db.update(events).set(updatedEvent).where(eq(events.id, body.id));
  // Only call addToSyncQueue if available (client-side only)
  // This should never be called server-side; offline.ts is for client-side usage
  if (dbm instanceof DatabaseManagerClient)
    await dbm.addToSyncQueue('PUT', '/api/events', updatedEvent);

  return {
    success: true,
    data: updatedEvent,
    message: 'Event updated successfully',
  };
}

export async function del(req: Request) {
  const url = new URL(req.url, getBaseUrl());
  const id = url.searchParams.get('id');
  if (!id) {
    return { success: false, error: 'Event ID is required' };
  }

  await dbm.ensureDatabaseInitialised();
  const db = dbm.getLocal();

  const existingArr = await db
    .select()
    .from(events)
    .where(eq(events.id, id ?? ''));
  const existing = existingArr[0];
  if (!existing) {
    return { success: false, error: 'Event not found' };
  }
  await db.delete(events).where(eq(events.id, id));
  // Only call addToSyncQueue if available (client-side only)
  // This should never be called server-side; offline.ts is for client-side usage
  if (dbm instanceof DatabaseManagerClient)
    await (dbm as any).addToSyncQueue('DELETE', `/api/events?id=${id}`);

  return {
    success: true,
    message: 'Event deleted successfully',
  };
}
