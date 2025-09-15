import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { HomicideCase, ApiResponse } from '@/lib/types/homicide';

// In-memory storage for now - replace with database integration later
let homicideCases: HomicideCase[] = [];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    let filteredCases = homicideCases;

    // Apply search filter if provided
    if (search) {
      const searchLower = search.toLowerCase();
      filteredCases = homicideCases.filter(case_ => 
        case_.articleData.newsReportHeadline.toLowerCase().includes(searchLower) ||
        case_.articleData.newsSource.toLowerCase().includes(searchLower) ||
        case_.victims.some(victim => 
          victim.victimName.toLowerCase().includes(searchLower) ||
          victim.province.toLowerCase().includes(searchLower)
        ) ||
        case_.typeOfMurder.toLowerCase().includes(searchLower)
      );
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const paginatedCases = filteredCases.slice(startIndex, startIndex + limit);

    const response: ApiResponse<any> = {
      success: true,
      data: {
        cases: paginatedCases,
        total: filteredCases.length,
        page,
        limit,
        totalPages: Math.ceil(filteredCases.length / limit)
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching homicide cases:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch homicide cases',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.articleData || !body.victims || !body.perpetrators || !body.typeOfMurder) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields',
          message: 'Article data, victims, perpetrators, and murder type are required'
        },
        { status: 400 }
      );
    }

    // Create new homicide case
    const homicideCase: HomicideCase = {
      id: body.id || uuidv4(),
      articleData: body.articleData,
      victims: body.victims,
      perpetrators: body.perpetrators,
      typeOfMurder: body.typeOfMurder,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Validate article data
    const requiredArticleFields = ['newsReportUrl', 'newsReportHeadline', 'dateOfPublication', 'newsSource'];
    for (const field of requiredArticleFields) {
      if (!homicideCase.articleData[field as keyof typeof homicideCase.articleData]) {
        return NextResponse.json(
          { 
            success: false, 
            error: `Missing required article field: ${field}` 
          },
          { status: 400 }
        );
      }
    }

    // Validate victims
    if (!Array.isArray(homicideCase.victims) || homicideCase.victims.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'At least one victim is required' 
        },
        { status: 400 }
      );
    }

    // Validate each victim
    for (let i = 0; i < homicideCase.victims.length; i++) {
      const victim = homicideCase.victims[i];
      const requiredVictimFields = ['victimName', 'dateOfDeath', 'province', 'genderOfVictim'];
      for (const field of requiredVictimFields) {
        if (!victim[field as keyof typeof victim]) {
          return NextResponse.json(
            { 
              success: false, 
              error: `Missing required victim field for victim ${i + 1}: ${field}` 
            },
            { status: 400 }
          );
        }
      }
    }

    // Validate perpetrators
    if (!Array.isArray(homicideCase.perpetrators) || homicideCase.perpetrators.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'At least one perpetrator is required' 
        },
        { status: 400 }
      );
    }

    // Add to storage
    homicideCases.push(homicideCase);

    // Generate unique article ID based on URL, headline, and author
    const articleId = uuidv4(); // For now, generate random ID

    const response: ApiResponse<HomicideCase> = {
      success: true,
      data: homicideCase,
      message: 'Homicide case saved successfully'
    };

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Error saving homicide case:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to save homicide case',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Case ID is required' 
        },
        { status: 400 }
      );
    }

    const index = homicideCases.findIndex(case_ => case_.id === id);
    
    if (index === -1) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Case not found' 
        },
        { status: 404 }
      );
    }

    homicideCases.splice(index, 1);

    return NextResponse.json({ 
      success: true, 
      message: 'Case deleted successfully' 
    });

  } catch (error) {
    console.error('Error deleting homicide case:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete homicide case',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
