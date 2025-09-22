import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { databaseManager } from '../../../lib/database/connection';
import * as schema from '../../../lib/database/schema';
import { generateSchema } from '../../../lib/schema/utils';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request: NextRequest) {
  // Ensure local database is initialized
  const { ensureDatabaseInitialized } = await import(
    '../../../lib/database/init'
  );
  await ensureDatabaseInitialized();
  try {
    const db = databaseManager.getLocal();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    let allEvents = await db.select().from(schema.events);
    console.log('All events from DB:', allEvents);
    // Filter in JS by eventTypes and details
    let filteredEvents = allEvents;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredEvents = allEvents.filter((event) => {
        const eventTypes = Array.isArray(event.eventTypes)
          ? event.eventTypes
          : typeof event.eventTypes === 'string'
            ? JSON.parse(event.eventTypes || '[]')
            : [];
        const details =
          typeof event.details === 'string'
            ? JSON.parse(event.details || '{}')
            : event.details;
        // Search in eventTypes and details fields
        return (
          eventTypes.some((type: string) =>
            type.toLowerCase().includes(searchLower),
          ) ||
          Object.values(details).some(
            (val: unknown) =>
              typeof val === 'string' &&
              val.toLowerCase().includes(searchLower),
          )
        );
      });
      console.log('Filtered events after search:', filteredEvents);
    }
    // Pagination
    const startIndex = (page - 1) * limit;
    const paginatedEvents = filteredEvents.slice(
      startIndex,
      startIndex + limit,
    );
    console.log('Paginated events:', paginatedEvents);
    const total = filteredEvents.length;

    return NextResponse.json({
      success: true,
      data: {
        events: Array.isArray(paginatedEvents) ? paginatedEvents : [],
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch events',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  // Ensure local database is initialized
  const { ensureDatabaseInitialized } = await import(
    '../../../lib/database/init'
  );
  await ensureDatabaseInitialized();
  try {
    const body = await request.json();
    // Validate required fields
    if (
      !body.eventTypes ||
      !body.articleIds ||
      !body.participantIds ||
      !body.details
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          message:
            'eventTypes, articleIds, participantIds, and details are required',
        },
        { status: 400 },
      );
    }
    // Validate details using new folder structure
    const eventTypes = Array.isArray(body.eventTypes)
      ? body.eventTypes
      : JSON.parse(body.eventTypes);
    const details =
      typeof body.details === 'string'
        ? JSON.parse(body.details)
        : body.details;

    // Only load homicide schemas if 'homicide' is in eventTypes
    if (eventTypes.includes('homicide')) {
      // Validate event details
      const eventSchemaPath = path.join(
        process.cwd(),
        'public',
        'schemas',
        'event',
        'homicide.json',
      );
      const eventSchemaJson = JSON.parse(
        await fs.readFile(eventSchemaPath, 'utf-8'),
      );
      try {
        generateSchema(eventSchemaJson).parse(details);
      } catch (validationError) {
        return NextResponse.json(
          {
            success: false,
            error: 'Event validation failed',
            message:
              typeof validationError === 'object' &&
              validationError !== null &&
              'errors' in validationError
                ? (validationError as { errors: unknown }).errors
                : 'Unknown event validation error',
          },
          { status: 400 },
        );
      }
    }
    // Save to local database
    const db = databaseManager.getLocal();
    const { v4: uuidv4 } = await import('uuid');
    const id = body.eventId || uuidv4();
    const [insertedEvent] = await db
      .insert(schema.events)
      .values({
        id,
        eventTypes: eventTypes,
        articleIds: body.articleIds,
        participantIds: body.participantIds,
        details: details,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .returning();
    console.log('Inserted event:', insertedEvent);
    return NextResponse.json(
      {
        success: true,
        message: 'Event saved successfully',
        data: insertedEvent,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Error saving event:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to save event',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Event ID is required' },
        { status: 400 },
      );
    }
    const db = databaseManager.getLocal();
    const { eq } = await import('drizzle-orm');
    await db.delete(schema.events).where(eq(schema.events.id, id));
    return NextResponse.json({
      success: true,
      message: 'Event deleted successfully',
      data: {},
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete event',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
