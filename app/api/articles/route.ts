import { NextResponse } from 'next/server';
import { get, post, put, del } from './offline';

export async function GET(request: Request) {
  const result = await get(request);
  return NextResponse.json(result);
}

export async function POST(req: Request) {
  const result = await post(req);
  return NextResponse.json(result);
}

export async function PUT(req: Request) {
  const result = await put(req);
  return NextResponse.json(result);
}

export async function DELETE(req: Request) {
  const result = await del(req);
  return NextResponse.json(result);
}
