'use client';

import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col } from 'react-bootstrap';
import { ArticleData } from '@/lib/types/homicide';
import { v4 as uuidv4 } from 'uuid';

interface ArticleFormProps {
  onSubmit: (data: ArticleData) => void;
  initialData?: ArticleData;
}

const ArticleForm: React.FC<ArticleFormProps> = ({ onSubmit, initialData }) => {
  // Default data for dev/testing
  const DEV_DEFAULT_DATA: ArticleData = {
    newsReportUrl: 'https://example.com/news/sample',
    newsReportHeadline: 'Sample Headline',
    dateOfPublication: '2025-09-25',
    author: 'Jane Doe',
    wireService: 'Reuters',
    language: 'english',
    sourceType: 'online',
    newsSource: 'News24',
  };
  const [formData, setFormData] = useState<ArticleData>(
    initialData || DEV_DEFAULT_DATA,
  );

  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    // Validate required fields
    const required = [
      'newsReportUrl',
      'newsReportHeadline',
      'dateOfPublication',
      'newsSource',
    ];
    const allRequiredFilled = required.every(
      (field) => formData[field as keyof ArticleData].toString().trim() !== '',
    );
    setIsValid(allRequiredFilled);
  }, [formData]);

  const handleChange = (field: keyof ArticleData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      onSubmit(formData);
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
                <Form.Label>News Source *</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.newsSource}
                  onChange={(e) => handleChange('newsSource', e.target.value)}
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
                  value={formData.sourceType}
                  onChange={(e) => handleChange('sourceType', e.target.value)}
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
