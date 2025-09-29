import { NextResponse } from 'next/server';
import { get, post, put } from './offline';

/**
 * GET /api/victims - Retrieve all victims
 */
export async function GET(request: Request) {
  const result = await get(request);
  return NextResponse.json(result);
}

/**
 * POST /api/victims - Create new victim
 */
export async function POST(req: Request) {
  const result = await post(req);
  return NextResponse.json(result);
}

/**
 * PUT /api/victims - Update existing victim
 */
export async function PUT(req: Request) {
  const result = await put(req);
  return NextResponse.json(result);
}
