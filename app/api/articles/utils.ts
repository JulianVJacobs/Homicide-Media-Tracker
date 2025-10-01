import type { Article } from '../../../lib/db/schema';
import {
  toNullableIsoString,
  toNullableString,
} from '../../../lib/utils/coercion';

const coreFields: ArticleCoreFields[] = [
  'newsReportId',
  'newsReportUrl',
  'newsReportHeadline',
  'dateOfPublication',
  'author',
  'wireService',
  'language',
  'typeOfSource',
  'newsReportPlatform',
  'notes',
];

type ArticleCoreFields =
  | 'newsReportId'
  | 'newsReportUrl'
  | 'newsReportHeadline'
  | 'dateOfPublication'
  | 'author'
  | 'wireService'
  | 'language'
  | 'typeOfSource'
  | 'newsReportPlatform'
  | 'notes';

export type ArticleCore = Pick<Article, ArticleCoreFields>;

const fieldTransformers: Record<
  ArticleCoreFields,
  (value: unknown, fallback: string | null) => string | null
> = {
  newsReportId: toNullableString,
  newsReportUrl: toNullableString,
  newsReportHeadline: toNullableString,
  dateOfPublication: toNullableIsoString,
  author: toNullableString,
  wireService: toNullableString,
  language: toNullableString,
  typeOfSource: toNullableString,
  newsReportPlatform: toNullableString,
  notes: toNullableString,
};

export const coerceArticle = (
  data: Record<string, unknown>,
  current?: Article,
): ArticleCore => {
  const result = {} as ArticleCore;

  for (const field of coreFields) {
    const transform = fieldTransformers[field];
    const fallback = current?.[field] ?? null;
    result[field] = transform(data[field], fallback);
  }

  return result;
};
