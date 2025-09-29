/**
 * Database Utilities for Homicide Media Tracker
 *
 * This module provides utility functions for data processing,
 * article ID generation, and duplicate detection.
 */

import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

/**
 * Generate unique article ID from URL, author, and title
 * This helps identify duplicate articles across different data sources
 */
export function generateArticleId(
  url: string,
  author: string,
  title: string,
): string {
  // Normalise inputs for consistent ID generation
  const normalisedUrl = url
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '');
  const normalisedAuthor = author.trim().toLowerCase();
  const normalisedTitle = title.trim().toLowerCase();

  // Create hash from combined normalised data
  const combined = `${normalisedUrl}|${normalisedAuthor}|${normalisedTitle}`;
  const hash = crypto
    .createHash('sha256')
    .update(combined, 'utf8')
    .digest('hex');

  // Return first 16 characters for readability while maintaining uniqueness
  return `art_${hash.substring(0, 16)}`;
}

/**
 * Generate unique user ID
 */
export function generateUserId(): string {
  return `usr_${uuidv4().replace(/-/g, '').substring(0, 16)}`;
}

/**
 * Validate article data before insertion
 */
export interface ArticleValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateArticleData(article: any): ArticleValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!article.newsReportUrl || article.newsReportUrl.trim() === '') {
    errors.push('News report URL is required');
  }

  if (!article.newsReportHeadline || article.newsReportHeadline.trim() === '') {
    errors.push('News report headline is required');
  }

  if (!article.author || article.author.trim() === '') {
    warnings.push('Author is missing - this may affect duplicate detection');
  }

  // URL validation
  if (article.newsReportUrl) {
    try {
      new URL(article.newsReportUrl);
    } catch {
      errors.push('News report URL is not valid');
    }
  }

  // Date validation
  if (article.dateOfPublication) {
    const date = new Date(article.dateOfPublication);
    if (isNaN(date.getTime())) {
      errors.push('Date of publication is not valid');
    }

    // Check if date is in the future
    if (date > new Date()) {
      warnings.push('Date of publication is in the future');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate victim data
 */
export function validateVictimData(victim: any): ArticleValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Age validation
  if (victim.ageOfVictim !== undefined && victim.ageOfVictim !== null) {
    const age = Number(victim.ageOfVictim);
    if (isNaN(age) || age < 0 || age > 150) {
      errors.push('Age of victim must be a valid number between 0 and 150');
    }
  }

  // Date of death validation
  if (victim.dateOfDeath) {
    const date = new Date(victim.dateOfDeath);
    if (isNaN(date.getTime())) {
      errors.push('Date of death is not valid');
    }

    // Check if date is in the future
    if (date > new Date()) {
      warnings.push('Date of death is in the future');
    }
  }

  // Required location information
  if (!victim.placeOfDeathProvince && !victim.placeOfDeathTown) {
    warnings.push(
      'Location information (province or town) would help with analysis',
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate perpetrator data
 */
export function validatePerpetratorData(perpetrator: any): ArticleValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Article ID is required
  if (!perpetrator.articleId) {
    errors.push('Article ID is required');
  }

  // Suspect identification validation
  if (perpetrator.suspectIdentified === 'Yes' && !perpetrator.perpetratorName) {
    warnings.push('Suspect is identified but no name provided');
  }

  if (perpetrator.suspectIdentified === 'No' && perpetrator.perpetratorName) {
    warnings.push('Suspect marked as not identified but name is provided');
  }

  // Legal process validation
  if (
    perpetrator.suspectArrested === 'Yes' &&
    perpetrator.suspectCharged === 'No'
  ) {
    warnings.push('Suspect arrested but not charged - unusual legal process');
  }

  if (
    perpetrator.suspectCharged === 'Yes' &&
    perpetrator.suspectArrested === 'No'
  ) {
    errors.push('Suspect cannot be charged without being arrested first');
  }

  if (perpetrator.conviction === 'Yes' && perpetrator.suspectCharged === 'No') {
    errors.push('Suspect cannot be convicted without being charged first');
  }

  if (perpetrator.conviction === 'Yes' && !perpetrator.sentence) {
    warnings.push('Conviction recorded but no sentence information provided');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Detect potential duplicate articles based on similarity
 */
export interface DuplicateMatch {
  id: string;
  similarity: number;
  matchType: 'url' | 'title' | 'content';
  confidence: 'high' | 'medium' | 'low';
}

export function detectDuplicates(
  newArticle: any,
  existingArticles: any[],
): DuplicateMatch[] {
  const matches: DuplicateMatch[] = [];

  for (const existing of existingArticles) {
    // Exact URL match
    if (newArticle.newsReportUrl === existing.newsReportUrl) {
      matches.push({
        id: existing.id,
        similarity: 1.0,
        matchType: 'url',
        confidence: 'high',
      });
      continue;
    }

    // Title similarity using Levenshtein distance
    const titleSimilarity = calculateSimilarity(
      newArticle.newsReportHeadline || '',
      existing.newsReportHeadline || '',
    );

    if (titleSimilarity > 0.85) {
      matches.push({
        id: existing.id,
        similarity: titleSimilarity,
        matchType: 'title',
        confidence: titleSimilarity > 0.95 ? 'high' : 'medium',
      });
    }
  }

  return matches.sort((a, b) => b.similarity - a.similarity);
}

/**
 * Calculate similarity between two strings using Levenshtein distance
 */
function calculateSimilarity(str1: string, str2: string): number {
  const matrix: number[][] = [];
  const len1 = str1.length;
  const len2 = str2.length;

  if (len1 === 0) return len2 === 0 ? 1 : 0;
  if (len2 === 0) return 0;

  // Initialise matrix
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost, // substitution
      );
    }
  }

  const distance = matrix[len1][len2];
  const maxLength = Math.max(len1, len2);

  return 1 - distance / maxLength;
}

/**
 * Normalise data for consistency
 */
export function normaliseData(data: any): any {
  const normalised = { ...data };

  // Normalise strings
  for (const key of Object.keys(normalised)) {
    if (typeof normalised[key] === 'string') {
      normalised[key] = normalised[key].trim();

      // Handle empty strings
      if (normalised[key] === '') {
        normalised[key] = null;
      }
    }
  }

  // Normalise dates to ISO format
  if (normalised.dateOfPublication) {
    try {
      normalised.dateOfPublication = new Date(
        normalised.dateOfPublication,
      ).toISOString();
    } catch {
      normalised.dateOfPublication = null;
    }
  }

  if (normalised.dateOfDeath) {
    try {
      normalised.dateOfDeath = new Date(normalised.dateOfDeath).toISOString();
    } catch {
      normalised.dateOfDeath = null;
    }
  }

  return normalised;
}

/**
 * Export data to various formats
 */
export interface ExportOptions {
  format: 'json' | 'csv' | 'xlsx';
  includeMetadata: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  filters?: {
    province?: string;
    modeOfDeath?: string;
    suspectArrested?: boolean;
  };
}

export async function exportData(
  articles: any[],
  victims: any[],
  perpetrators: any[],
  options: ExportOptions,
): Promise<string> {
  // Filter data based on options
  let filteredArticles = articles;

  if (options.dateRange) {
    filteredArticles = articles.filter((article) => {
      const pubDate = new Date(article.dateOfPublication);
      return (
        pubDate >= options.dateRange!.start && pubDate <= options.dateRange!.end
      );
    });
  }

  // Combine data for export
  const exportData = filteredArticles.map((article) => {
    const articleVictims = victims.filter(
      (v) => v.articleId === article.articleId,
    );
    const articlePerpetrators = perpetrators.filter(
      (p) => p.articleId === article.articleId,
    );

    return {
      ...article,
      victims: articleVictims,
      perpetrators: articlePerpetrators,
    };
  });

  switch (options.format) {
    case 'json':
      return JSON.stringify(exportData, null, 2);

    case 'csv':
      // Flatten data for CSV export
      return exportToCsv(exportData);

    case 'xlsx':
      // This would require additional Excel library implementation
      throw new Error('XLSX export not implemented yet');

    default:
      throw new Error(`Unsupported export format: ${options.format}`);
  }
}

/**
 * Convert data to CSV format
 */
function exportToCsv(data: any[]): string {
  if (data.length === 0) return '';

  // Flatten the nested structure
  const flattened = data.flatMap((article) => {
    if (article.victims.length === 0 && article.perpetrators.length === 0) {
      return [{ ...article, victims: [], perpetrators: [] }];
    }

    const rows: any[] = [];
    const maxRows = Math.max(
      article.victims.length,
      article.perpetrators.length,
    );

    for (let i = 0; i < maxRows; i++) {
      rows.push({
        ...article,
        victim: article.victims[i] || {},
        perpetrator: article.perpetrators[i] || {},
      });
    }

    return rows;
  });

  // Get all unique keys for CSV headers
  const keys = new Set<string>();
  flattened.forEach((row) => {
    Object.keys(row).forEach((key) => {
      if (key !== 'victims' && key !== 'perpetrators') {
        keys.add(key);
      }
    });

    if (row.victim) {
      Object.keys(row.victim).forEach((key) => keys.add(`victim_${key}`));
    }

    if (row.perpetrator) {
      Object.keys(row.perpetrator).forEach((key) =>
        keys.add(`perpetrator_${key}`),
      );
    }
  });

  const headers = Array.from(keys).sort();
  const csvRows = [headers.join(',')];

  // Convert rows to CSV
  flattened.forEach((row) => {
    const values = headers.map((header) => {
      let value: any;

      if (header.startsWith('victim_')) {
        const key = header.replace('victim_', '');
        value = row.victim?.[key] || '';
      } else if (header.startsWith('perpetrator_')) {
        const key = header.replace('perpetrator_', '');
        value = row.perpetrator?.[key] || '';
      } else {
        value = row[header] || '';
      }

      // Escape CSV values
      if (
        typeof value === 'string' &&
        (value.includes(',') || value.includes('"'))
      ) {
        value = `"${value.replace(/"/g, '""')}"`;
      }

      return value;
    });

    csvRows.push(values.join(','));
  });

  return csvRows.join('\n');
}

/**
 * sanitise data for safe storage
 */
export function sanitiseData(data: any): any {
  const sanitised = { ...data };

  // Remove potential XSS vectors
  for (const key of Object.keys(sanitised)) {
    if (typeof sanitised[key] === 'string') {
      // Basic XSS prevention
      sanitised[key] = sanitised[key]
        .replace(/<script[^>]*>.*<\/script>/gi, '')
        .replace(/<iframe[^>]*>.*<\/iframe>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '');
    }
  }

  return sanitised;
}
