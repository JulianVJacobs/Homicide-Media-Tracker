'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, Form, Button, Row, Col } from 'react-bootstrap';
import type { NewArticle } from '@/lib/db/schema';

type ArticleFieldKeys = Extract<
  keyof NewArticle,
  | 'newsReportUrl'
  | 'newsReportHeadline'
  | 'dateOfPublication'
  | 'author'
  | 'wireService'
  | 'language'
  | 'typeOfSource'
  | 'newsReportPlatform'
  | 'notes'
>;

type ArticleFormValues = {
  [K in ArticleFieldKeys]: NonNullable<NewArticle[K]> | '';
};

interface ArticleFormProps {
  onSubmit: (data: ArticleFormValues) => void;
  initialData?: Partial<ArticleFormValues> | null;
}

const buildInitialState = (
  initialData?: Partial<ArticleFormValues> | null,
): ArticleFormValues => ({
  newsReportUrl: initialData?.newsReportUrl ?? '',
  newsReportHeadline: initialData?.newsReportHeadline ?? '',
  dateOfPublication: initialData?.dateOfPublication ?? '',
  author: initialData?.author ?? '',
  wireService: initialData?.wireService ?? '',
  language: initialData?.language ?? '',
  typeOfSource: initialData?.typeOfSource ?? '',
  newsReportPlatform: initialData?.newsReportPlatform ?? '',
  notes: initialData?.notes ?? '',
});

const ArticleForm: React.FC<ArticleFormProps> = ({ onSubmit, initialData }) => {
  const [formData, setFormData] = useState<ArticleFormValues>(
    buildInitialState(initialData),
  );

  const [isValid, setIsValid] = useState(false);
  const [outletOptions, setOutletOptions] = useState<string[]>([]);
  const [outletLoading, setOutletLoading] = useState(false);
  const [outletSaving, setOutletSaving] = useState(false);

  useEffect(() => {
    // Validate required fields
    const required = [
      'newsReportUrl',
      'newsReportHeadline',
      'dateOfPublication',
      'newsReportPlatform',
    ];
    const allRequiredFilled = required.every((field) => {
      const value = formData[field as keyof ArticleFormValues];
      return (
        (typeof value === 'string' ? value : (value ?? ''))
          .toString()
          .trim() !== ''
      );
    });
    setIsValid(allRequiredFilled);
  }, [formData]);

  useEffect(() => {
    setFormData(buildInitialState(initialData));
  }, [initialData]);

  useEffect(() => {
    let ignore = false;

    const loadOutlets = async () => {
      try {
        setOutletLoading(true);
        const params = new URLSearchParams({
          query: formData.newsReportPlatform ?? '',
          limit: '12',
        });
        const response = await fetch(`/api/articles/outlets?${params.toString()}`);
        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as {
          success?: boolean;
          data?: unknown;
        };
        if (!ignore && payload.success && Array.isArray(payload.data)) {
          const options = payload.data.filter(
            (item): item is string => typeof item === 'string' && item.trim().length > 0,
          );
          setOutletOptions(options);
        }
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Failed to fetch outlet suggestions', error);
        }
      } finally {
        if (!ignore) {
          setOutletLoading(false);
        }
      }
    };

    const timeout = setTimeout(loadOutlets, 180);
    return () => {
      ignore = true;
      clearTimeout(timeout);
    };
  }, [formData.newsReportPlatform]);

  const handleChange = (field: keyof ArticleFormValues, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      const payload: ArticleFormValues = {
        ...formData,
        notes: formData.notes?.trim() || '',
      };
      onSubmit(payload);
    }
  };

  const normalizedOutletValue = useMemo(
    () => formData.newsReportPlatform.trim(),
    [formData.newsReportPlatform],
  );
  const hasExactOutletMatch = useMemo(
    () =>
      outletOptions.some(
        (option) => option.toLowerCase() === normalizedOutletValue.toLowerCase(),
      ),
    [outletOptions, normalizedOutletValue],
  );

  const handleAddNewOutlet = async () => {
    if (!normalizedOutletValue || hasExactOutletMatch) {
      return;
    }

    try {
      setOutletSaving(true);
      const response = await fetch('/api/articles/outlets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ outlet: normalizedOutletValue }),
      });

      if (!response.ok) {
        return;
      }

      setOutletOptions((prev) => {
        const next = [...prev, normalizedOutletValue];
        return next
          .filter((value, index, arr) => {
            const key = value.toLowerCase();
            return arr.findIndex((item) => item.toLowerCase() === key) === index;
          })
          .sort((left, right) => left.localeCompare(right));
      });
      handleChange('newsReportPlatform', normalizedOutletValue);
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Failed to add outlet option', error);
      }
    } finally {
      setOutletSaving(false);
    }
  };

  const sourceTypeOptions = [
    { value: '', label: 'Select Source Type' },
    { value: 'newspaper', label: 'Newspaper' },
    { value: 'online', label: 'Online News' },
    { value: 'television', label: 'Television' },
    { value: 'radio', label: 'Radio' },
    { value: 'magazine', label: 'Magazine' },
    { value: 'blog', label: 'Blog' },
    { value: 'social_media', label: 'Social Media' },
    { value: 'other', label: 'Other' },
  ];

  const languageOptions = [
    { value: '', label: 'Select Language' },
    { value: 'english', label: 'English' },
    { value: 'afrikaans', label: 'Afrikaans' },
    { value: 'zulu', label: 'Zulu' },
    { value: 'xhosa', label: 'Xhosa' },
    { value: 'sotho', label: 'Sotho' },
    { value: 'tswana', label: 'Tswana' },
    { value: 'pedi', label: 'Pedi' },
    { value: 'venda', label: 'Venda' },
    { value: 'tsonga', label: 'Tsonga' },
    { value: 'ndebele', label: 'Ndebele' },
    { value: 'swati', label: 'Swati' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <Card className="mb-4">
      <Card.Header>
        <h4 className="mb-0">Article Information</h4>
      </Card.Header>
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>News Report URL *</Form.Label>
                <Form.Control
                  type="url"
                  value={formData.newsReportUrl}
                  onChange={(e) =>
                    handleChange('newsReportUrl', e.target.value)
                  }
                  placeholder="https://..."
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>News Report Headline *</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.newsReportHeadline}
                  onChange={(e) =>
                    handleChange('newsReportHeadline', e.target.value)
                  }
                  placeholder="Enter the headline of the news report"
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Date of Publication *</Form.Label>
                <Form.Control
                  type="date"
                  value={formData.dateOfPublication}
                  onChange={(e) =>
                    handleChange('dateOfPublication', e.target.value)
                  }
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>News Report Platform *</Form.Label>
                <Form.Control
                  type="text"
                  list="news-outlet-options"
                  value={formData.newsReportPlatform}
                  onChange={(e) =>
                    handleChange('newsReportPlatform', e.target.value)
                  }
                  placeholder="e.g., News24, IOL, TimesLIVE"
                  required
                />
                <datalist id="news-outlet-options">
                  {outletOptions.map((option) => (
                    <option key={option} value={option} />
                  ))}
                </datalist>
                <div className="d-flex justify-content-between mt-2">
                  <Form.Text className="text-muted">
                    {outletLoading
                      ? 'Loading outlet matches…'
                      : 'Search existing outlets or enter a new one.'}
                  </Form.Text>
                  {normalizedOutletValue && !hasExactOutletMatch && (
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      type="button"
                      onClick={handleAddNewOutlet}
                      disabled={outletSaving}
                    >
                      {outletSaving
                        ? 'Adding...'
                        : `Add "${normalizedOutletValue}"`}
                    </Button>
                  )}
                </div>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Author</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.author}
                  onChange={(e) => handleChange('author', e.target.value)}
                  placeholder="Author name"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Wire Service</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.wireService}
                  onChange={(e) => handleChange('wireService', e.target.value)}
                  placeholder="e.g., SAPA, Reuters, AP"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Language</Form.Label>
                <Form.Select
                  value={formData.language}
                  onChange={(e) => handleChange('language', e.target.value)}
                >
                  {languageOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Source Type</Form.Label>
                <Form.Select
                  value={formData.typeOfSource}
                  onChange={(e) => handleChange('typeOfSource', e.target.value)}
                >
                  {sourceTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex justify-content-end">
            <Button type="submit" variant="primary" disabled={!isValid}>
              Save Article Information
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default ArticleForm;

export type { ArticleFormValues };
