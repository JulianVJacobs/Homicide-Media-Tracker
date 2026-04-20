import { detectDuplicates } from './utils';

describe('detectDuplicates', () => {
  it('returns explainability fields for URL matches', () => {
    const matches = detectDuplicates(
      {
        newsReportUrl: 'https://example.com/report-1',
        newsReportHeadline: 'Story A',
      },
      [
        {
          id: 'article-1',
          newsReportUrl: 'https://example.com/report-1',
          newsReportHeadline: 'Story B',
        },
      ],
    );

    expect(matches).toHaveLength(1);
    expect(matches[0]).toMatchObject({
      id: 'article-1',
      matchType: 'url',
      matchReason: 'exact_url_match',
      matchedFields: ['newsReportUrl'],
    });
    expect(matches[0].explainability).toBe(
      'The newsReportUrl values are an exact match.',
    );
    expect(matches[0].scoring.summaryRationale).toContain('Primary url signal');
    expect(matches[0].scoring.whyMatched).toContain(
      'Matched fields: newsReportUrl',
    );
    expect(matches[0].scoring.weightedContributions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          signal: 'url',
          weight: 0.6,
          rawScore: 1,
          weightedScore: 0.6,
        }),
      ]),
    );
  });

  it('matches primary name against aliases and returns reason fields', () => {
    const matches = detectDuplicates(
      {
        newsReportHeadline: 'Unrelated headline',
        primaryName: 'Nomvula Mthembu',
      },
      [
        {
          id: 'article-2',
          newsReportHeadline: 'Different headline',
          primaryName: 'Unknown',
          aliases: ['Nomvula Mthembu', 'Nomz'],
        },
      ],
    );

    expect(matches).toHaveLength(1);
    expect(matches[0]).toMatchObject({
      id: 'article-2',
      matchType: 'name',
      matchReason: 'name_alias_overlap',
    });
    expect(matches[0].matchedFields).toEqual(
      expect.arrayContaining(['primaryName', 'aliases']),
    );
    expect(matches[0].explainability).toContain('primaryName');
    expect(matches[0].scoring.summaryRationale).toContain('Primary name signal');
    expect(matches[0].scoring.whyMatched).toContain('Reason code: name');
  });

  it('keeps title matching behavior with explainability details', () => {
    const matches = detectDuplicates(
      {
        newsReportHeadline: 'Johannesburg homicide investigation expands',
      },
      [
        {
          id: 'article-3',
          newsReportHeadline: 'Johannesburg homicide investigation expands now',
        },
      ],
    );

    expect(matches).toHaveLength(1);
    expect(matches[0]).toMatchObject({
      id: 'article-3',
      matchType: 'title',
      matchReason: 'headline_similarity',
      matchedFields: ['newsReportHeadline'],
    });
    expect(matches[0].explainability).toContain('similar');
    expect(matches[0].scoring.totalWeightedScore).toBeGreaterThan(0);
    expect(matches[0].scoring.weightedContributions).toHaveLength(3);
  });
});
