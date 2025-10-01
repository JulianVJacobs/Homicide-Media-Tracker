'use client';

import React, { useState, useEffect } from 'react';
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
                  value={formData.newsReportPlatform}
                  onChange={(e) =>
                    handleChange('newsReportPlatform', e.target.value)
                  }
                  placeholder="e.g., News24, IOL, TimesLIVE"
                  required
                />
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
