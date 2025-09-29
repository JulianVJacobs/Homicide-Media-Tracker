import { NextRequest, NextResponse } from 'next/server';
import { eq, like, or } from 'drizzle-orm';
import { dbm } from '../../../lib/db/manager';
import { generateUserId, sanitiseData } from '../../../lib/components/utils';
import * as schema from '../../../lib/db/schema';

/**
 * Validate user data
 */
function validateUserData(user: any) {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!user.username || user.username.trim() === '') {
    errors.push('Username is required');
  }

  if (!user.email || user.email.trim() === '') {
    warnings.push('Email is recommended for user identification');
  }

  // Email validation
  if (user.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user.email)) {
      errors.push('Invalid email format');
    }
  }

  // Role validation
  const validRoles = ['admin', 'researcher', 'editor', 'viewer'];
  if (user.role && !validRoles.includes(user.role)) {
    errors.push(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * GET /api/users - Retrieve all users
 */
export async function GET(request: NextRequest) {
  try {
    const db = dbm.getLocal();

    // Get query parameters for filtering
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const search = url.searchParams.get('search') || '';
    const role = url.searchParams.get('role') || '';
    const active = url.searchParams.get('active') || '';

    // Build query with filters
    let users;
    let total = 0;

    // Build where conditions
    const whereConditions = [];

    if (search) {
      whereConditions.push(
        or(
          like(schema.users.username, `%${search}%`),
          like(schema.users.email, `%${search}%`),
          like(schema.users.userId, `%${search}%`),
        ),
      );
    }

    if (role) {
      whereConditions.push(eq(schema.users.role, role));
    }

    if (active !== '') {
      whereConditions.push(eq(schema.users.isActive, active === 'true'));
    }

    // Execute query
    if (whereConditions.length > 0) {
      users = await db
        .select()
        .from(schema.users)
        .where(whereConditions.length === 1 ? whereConditions[0] : undefined)
        .limit(limit)
        .offset(offset);

      const totalResult = await db
        .select({ count: schema.users.id })
        .from(schema.users)
        .where(whereConditions.length === 1 ? whereConditions[0] : undefined);
      total = totalResult.length;
    } else {
      users = await db.select().from(schema.users).limit(limit).offset(offset);

      const totalResult = await db
        .select({ count: schema.users.id })
        .from(schema.users);
      total = totalResult.length;
    }

    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve users',
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/users - Create new user
 */
export async function POST(request: NextRequest) {
  try {
    const userData = await request.json();

    // Validate user data
    const validation = validateUserData(userData);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validation.errors,
          warnings: validation.warnings,
        },
        { status: 400 },
      );
    }

    // Sanitize data
    const sanitisedData = sanitiseData(userData);

    const db = dbm.getLocal();

    // Generate unique user ID
    const userId = generateUserId();

    // Create user record
    const newUser = await db
      .insert(schema.users)
      .values({
        userId,
        username: sanitisedData.username,
        email: sanitisedData.email,
        role: sanitisedData.role || 'researcher',
        isActive:
          sanitisedData.isActive !== undefined
            ? Boolean(sanitisedData.isActive)
            : true,
        createdAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        data: newUser[0],
        message: 'User created successfully',
        warnings: validation.warnings,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Failed to create user:', error);

    // Type-safe error handling
    const isConstraintError =
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 'SQLITE_CONSTRAINT_UNIQUE';

    if (isConstraintError) {
      return NextResponse.json(
        {
          success: false,
          error: 'User with this username or email already exists',
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create user' },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/users - Update existing user
 */
export async function PUT(request: NextRequest) {
  try {
    const { id, ...userData } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 },
      );
    }

    // Validate user data
    const validation = validateUserData(userData);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validation.errors,
          warnings: validation.warnings,
        },
        { status: 400 },
      );
    }

    // Sanitize data
    const sanitisedData = sanitiseData(userData);

    const db = dbm.getLocal();

    // Update user record
    const updatedUser = await db
      .update(schema.users)
      .set({
        username: sanitisedData.username,
        email: sanitisedData.email,
        role: sanitisedData.role,
        isActive:
          sanitisedData.isActive !== undefined
            ? Boolean(sanitisedData.isActive)
            : undefined,
      })
      .where(eq(schema.users.id, id))
      .returning();

    if (updatedUser.length === 0) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedUser[0],
      message: 'User updated successfully',
      warnings: validation.warnings,
    });
  } catch (error) {
    console.error('Failed to update user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update user' },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/users - Delete or deactivate user
 */
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const permanent = url.searchParams.get('permanent') === 'true';

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 },
      );
    }

    const db = dbm.getLocal();

    if (permanent) {
      // Permanently delete user record
      const deletedUser = await db
        .delete(schema.users)
        .where(eq(schema.users.id, parseInt(id)))
        .returning();

      if (deletedUser.length === 0) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 },
        );
      }

      return NextResponse.json({
        success: true,
        message: 'User permanently deleted',
      });
    } else {
      // Soft delete - deactivate user
      const deactivatedUser = await db
        .update(schema.users)
        .set({ isActive: false })
        .where(eq(schema.users.id, parseInt(id)))
        .returning();

      if (deactivatedUser.length === 0) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 },
        );
      }

      return NextResponse.json({
        success: true,
        message: 'User deactivated successfully',
        data: deactivatedUser[0],
      });
    }
  } catch (error) {
    console.error('Failed to delete user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete user' },
      { status: 500 },
    );
  }
}
