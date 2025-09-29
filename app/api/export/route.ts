import { NextRequest, NextResponse } from 'next/server';
import { eq, gte, lte, like, or, and } from 'drizzle-orm';
import { dbm } from '../../../lib/db/manager';
import * as schema from '../../../lib/db/schema';

/**
 * Interface for export filters
 */
interface ExportFilters {
  dateFrom?: string;
  dateTo?: string;
  province?: string;
  gender?: string;
  ageRange?: string;
  modeOfDeath?: string;
  suspectStatus?: string;
}

/**
 * GET /api/export - Export homicide data
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const format = url.searchParams.get('format') || 'json'; // json, csv, xlsx
    const includePersonalData =
      url.searchParams.get('includePersonalData') === 'true';

    // Parse filters
    const filters: ExportFilters = {
      dateFrom: url.searchParams.get('dateFrom') || undefined,
      dateTo: url.searchParams.get('dateTo') || undefined,
      province: url.searchParams.get('province') || undefined,
      gender: url.searchParams.get('gender') || undefined,
      ageRange: url.searchParams.get('ageRange') || undefined,
      modeOfDeath: url.searchParams.get('modeOfDeath') || undefined,
      suspectStatus: url.searchParams.get('suspectStatus') || undefined,
    };

    const db = dbm.getLocal();

    // Build where conditions for each table
    const articleWhereConditions = [];
    const victimWhereConditions = [];
    const perpetratorWhereConditions = [];

    // Apply date filters
    if (filters.dateFrom) {
      articleWhereConditions.push(
        gte(schema.articles.dateOfPublication, filters.dateFrom),
      );
    }
    if (filters.dateTo) {
      articleWhereConditions.push(
        lte(schema.articles.dateOfPublication, filters.dateTo),
      );
    }

    // Apply victim filters
    if (filters.province) {
      victimWhereConditions.push(
        eq(schema.victims.placeOfDeathProvince, filters.province),
      );
    }
    if (filters.gender) {
      victimWhereConditions.push(
        eq(schema.victims.genderOfVictim, filters.gender),
      );
    }
    if (filters.ageRange) {
      victimWhereConditions.push(
        eq(schema.victims.ageRangeOfVictim, filters.ageRange),
      );
    }
    if (filters.modeOfDeath) {
      victimWhereConditions.push(
        eq(schema.victims.modeOfDeathGeneral, filters.modeOfDeath),
      );
    }

    // Apply perpetrator filters
    if (filters.suspectStatus) {
      perpetratorWhereConditions.push(
        eq(schema.perpetrators.suspectIdentified, filters.suspectStatus),
      );
    }

    // Execute queries with proper conditions
    const articles =
      articleWhereConditions.length > 0
        ? await db
            .select()
            .from(schema.articles)
            .where(
              articleWhereConditions.length === 1
                ? articleWhereConditions[0]
                : and(...articleWhereConditions),
            )
        : await db.select().from(schema.articles);

    const victims =
      victimWhereConditions.length > 0
        ? await db
            .select()
            .from(schema.victims)
            .where(
              victimWhereConditions.length === 1
                ? victimWhereConditions[0]
                : and(...victimWhereConditions),
            )
        : await db.select().from(schema.victims);

    const perpetrators =
      perpetratorWhereConditions.length > 0
        ? await db
            .select()
            .from(schema.perpetrators)
            .where(
              perpetratorWhereConditions.length === 1
                ? perpetratorWhereConditions[0]
                : and(...perpetratorWhereConditions),
            )
        : await db.select().from(schema.perpetrators);

    // Remove personal data if not authorised
    let processedData = {
      articles,
      victims,
      perpetrators,
    };

    if (!includePersonalData) {
      processedData = {
        articles: articles.map((article: schema.Article) => ({
          ...article,
          // Remove or anonymize personal identifying information
          newsReportUrl: '[URL_REMOVED]',
          author: article.author ? '[AUTHOR_REMOVED]' : null,
        })),
        victims: victims.map((victim: schema.Victim) => ({
          ...victim,
          // Remove personal identifying information
          victimName: victim.victimName ? '[NAME_REMOVED]' : null,
        })),
        perpetrators: perpetrators.map((perpetrator: schema.Perpetrator) => ({
          ...perpetrator,
          // Remove personal identifying information
          perpetratorName: perpetrator.perpetratorName
            ? '[NAME_REMOVED]'
            : null,
        })),
      };
    }

    // Combine data for analysis
    const combinedData = articles.map((article: schema.Article) => {
      const articleVictims = victims.filter((v: schema.Victim) => v.articleId === article.id);
      const articlePerpetrators = perpetrators.filter(
        (p: schema.Perpetrator) => p.articleId === article.id,
      );

      return {
        article,
        victims: articleVictims,
        perpetrators: articlePerpetrators,
        victimCount: articleVictims.length,
        perpetratorCount: articlePerpetrators.length,
      };
    });

    // Generate response based on format
    switch (format.toLowerCase()) {
      case 'csv':
        return generateCSVResponse(combinedData, includePersonalData);
      case 'json':
      default:
        return NextResponse.json({
          success: true,
          data: {
            metadata: {
              exportedAt: new Date().toISOString(),
              totalRecords: combinedData.length,
              includesPersonalData: includePersonalData,
              filters: filters,
            },
            records: combinedData,
            summary: {
              totalArticles: articles.length,
              totalVictims: victims.length,
              totalPerpetrators: perpetrators.length,
            },
          },
        });
    }
  } catch (error) {
    console.error('Failed to export data:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to export data',
      },
      { status: 500 },
    );
  }
}

/**
 * Generate CSV response
 */
function generateCSVResponse(data: any[], includePersonalData: boolean) {
  const csvRows = [];

  // Header row
  const headers = [
    'Article_ID',
    'Publication_Date',
    'Headline',
    'Source_Type',
    'Language',
    'Province',
    'Town',
    'Victim_Gender',
    'Victim_Age',
    'Mode_of_Death',
    'Suspect_Identified',
    'Suspect_Arrested',
    'Conviction',
  ];

  if (includePersonalData) {
    headers.splice(3, 0, 'URL', 'Author');
    headers.splice(9, 0, 'Victim_Name');
    headers.splice(14, 0, 'Perpetrator_Name');
  }

  csvRows.push(headers.join(','));

  // Data rows
  for (const record of data) {
    const { article, victims, perpetrators } = record;

    // Create a row for each victim (or one row if no victims)
    const victimsToProcess = victims.length > 0 ? victims : [{}];

    for (const victim of victimsToProcess) {
      const perpetrator = perpetrators[0] || {}; // Take first perpetrator if any

      const row = [
        article.articleId,
        article.dateOfPublication || '',
        `"${(article.newsReportHeadline || '').replace(/"/g, '""')}"`,
        article.typeOfSource || '',
        article.language || '',
        victim.placeOfDeathProvince || '',
        victim.placeOfDeathTown || '',
        victim.genderOfVictim || '',
        victim.ageOfVictim || victim.ageRangeOfVictim || '',
        victim.modeOfDeathGeneral || '',
        perpetrator.suspectIdentified || '',
        perpetrator.suspectArrested || '',
        perpetrator.conviction || '',
      ];

      if (includePersonalData) {
        row.splice(3, 0, article.newsReportUrl || '');
        row.splice(4, 0, article.author || '');
        row.splice(10, 0, victim.victimName || '');
        row.splice(15, 0, perpetrator.perpetratorName || '');
      }

      csvRows.push(row.join(','));
    }
  }

  const csvContent = csvRows.join('\n');

  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="homicide_data_${new Date().toISOString().split('T')[0]}.csv"`,
    },
  });
}

/**
 * POST /api/export - Generate custom export with complex filters
 */
export async function POST(request: NextRequest) {
  try {
    const {
      format = 'json',
      includePersonalData = false,
      filters = {},
      fields = [],
      groupBy = null,
    } = await request.json();

    const db = dbm.getLocal();

    // This would implement more complex filtering and custom field selection
    // For now, redirect to GET with basic filters
    const searchParams = new URLSearchParams({
      format,
      includePersonalData: includePersonalData.toString(),
      ...filters,
    });

    // Create a new request object for the GET handler
    const newUrl = new URL(`${request.url}?${searchParams.toString()}`);
    const newRequest = new NextRequest(newUrl, { method: 'GET' });

    return await GET(newRequest);
  } catch (error) {
    console.error('Failed to export data:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to export data',
      },
      { status: 500 },
    );
  }
}
