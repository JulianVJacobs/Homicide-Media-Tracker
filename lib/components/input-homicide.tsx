'use client';

import React, { useState } from 'react';
import {
  Container,
  Card,
  Button,
  Alert,
  Row,
  Col,
  ProgressBar,
} from 'react-bootstrap';
import { toast } from 'react-toastify';
import { getBaseUrl } from '../utils/platform';
import { v4 as uuidv4 } from 'uuid';
import ArticleForm, { ArticleFormValues } from './article-form';
import VictimForm, { VictimFormValues } from './victim-form';
import PerpetratorForm, { PerpetratorFormValues } from './perpetrator-form';

interface InputHomicideProps {
  onBack: () => void;
}

const InputHomicide: React.FC<InputHomicideProps> = ({ onBack }) => {
  const [articleData, setArticleData] = useState<ArticleFormValues | null>(
    null,
  );
  const [victims, setVictims] = useState<VictimFormValues[]>([]);
  const [perpetrators, setPerpetrators] = useState<PerpetratorFormValues[]>([]);
  // Defensive: never set to undefined/null
  const [typeOfMurder, setTypeOfMurder] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Calculate progress
  const progress = () => {
    let completed = 0;
    if (articleData) completed += 25;
    if (victims.length > 0) completed += 25;
    if (perpetrators.length > 0) completed += 25;
    if (typeOfMurder) completed += 25;
    return completed;
  };

  const handleSubmitArticleForm = (data: ArticleFormValues) => {
    setArticleData(data);
    setCurrentStep(2);
    toast.success('Article information saved');
  };

  const handleSubmitVictimForm = (data: VictimFormValues) => {
    setVictims((prev = []) => [...prev, data]);
    toast.success('Victim added successfully');
  };

  const handleClearVictims = () => {
    setVictims([]);
    toast.info('All victims cleared');
  };

  const handleSubmitPerpetratorForm = (data: PerpetratorFormValues) => {
    setPerpetrators((prev = []) => [...prev, data]);
    toast.success('Perpetrator added successfully');
  };

  const handleClearPerpetrators = () => {
    setPerpetrators([]);
    toast.info('All perpetrators cleared');
  };

  const handleSubmitForm = async () => {
    if (!articleData) {
      toast.error('Please complete the article information');
      setCurrentStep(1);
      return;
    }

    if (victims.length === 0) {
      toast.error('Please add at least one victim');
      setCurrentStep(2);
      return;
    }

    if (perpetrators.length === 0) {
      toast.error('Please add at least one perpetrator');
      setCurrentStep(3);
      return;
    }

    if (!typeOfMurder.trim()) {
      toast.error('Please specify the type of murder');
      return;
    }

    try {
      setLoading(true);
      // Use offline.ts for all CRUD
      const { post: addArticle } = await import('@/app/api/articles/offline');
      const { post: addVictim } = await import('@/app/api/victims/offline');
      const { post: addPerpetrator } = await import(
        '@/app/api/perpetrators/offline'
      );
      const { post: addEvent } = await import('@/app/api/events/offline');
      // 1. Add article
      const articleReq = new Request(getBaseUrl(), {
        method: 'POST',
        body: JSON.stringify(articleData),
      });
      const articleResponse = await addArticle(articleReq);
      const articleId = articleResponse?.data?.id;

      if (!articleId) {
        throw new Error('Article creation failed: missing ID');
      }

      // 2. Add victims and get their IDs
      const victimIds: string[] = [];
      for (const victim of victims) {
        const req = new Request(getBaseUrl(), {
          method: 'POST',
          body: JSON.stringify({
            ...victim,
            articleId,
          }),
        });
        const victimResponse = await addVictim(req);
        if (victimResponse?.data?.id) victimIds.push(victimResponse.data.id);
      }

      // 3. Add perpetrators and get their IDs
      const perpetratorIds: string[] = [];
      for (const perpetrator of perpetrators) {
        const req = new Request(getBaseUrl(), {
          method: 'POST',
          body: JSON.stringify({
            ...perpetrator,
            articleId,
          }),
        });
        const perpetratorResponse = await addPerpetrator(req);
        if (perpetratorResponse?.data?.id)
          perpetratorIds.push(perpetratorResponse.data.id);
      }

      // 4. Add event referencing article and participant IDs
      const eventPayload = {
        id: uuidv4(),
        eventTypes: ['homicide'],
        articleIds: [articleId],
        participantIds: [...victimIds, ...perpetratorIds],
        details: {
          ...articleData,
          victims,
          perpetrators,
          typeOfMurder,
          createdAt: new Date().toISOString(),
        },
      };
      const eventReq = new Request(getBaseUrl(), {
        method: 'POST',
        body: JSON.stringify(eventPayload),
      });
      await addEvent(eventReq);
      toast.success('Homicide case saved successfully!');
      // Reset form
      setArticleData(null);
      setVictims([]);
      setPerpetrators([]);
      setTypeOfMurder('');
      setCurrentStep(1);
    } catch (error) {
      console.error('Error saving homicide case:', error);
      toast.error('Failed to save homicide case. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const typeOfMurderOptions = [
    { value: '', label: 'Select Type of Murder' },
    { value: 'Domestic Violence', label: 'Domestic Violence' },
    { value: 'Gang Related', label: 'Gang Related' },
    { value: 'Robbery Related', label: 'Robbery Related' },
    { value: 'Sexual Violence', label: 'Sexual Violence' },
    { value: 'Child Murder', label: 'Child Murder' },
    { value: 'Hate Crime', label: 'Hate Crime' },
    { value: 'Drug Related', label: 'Drug Related' },
    { value: 'Unknown/Other', label: 'Unknown/Other' },
  ];

  const isReadyToSubmit = Boolean(
    articleData &&
      victims.length > 0 &&
      perpetrators.length > 0 &&
      typeOfMurder.trim(),
  );

  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Input New Homicide Case</h2>
            <Button variant="outline-secondary" onClick={onBack}>
              Back to Home
            </Button>
          </div>

          {/* Progress indicator */}
          <Card className="mb-4">
            <Card.Body>
              <h5>Form Progress</h5>
              <ProgressBar
                now={progress()}
                label={`${progress()}%`}
                className="mb-2"
              />
              <div className="d-flex justify-content-between">
                <small className={articleData ? 'text-success' : 'text-muted'}>
                  ✓ Article Info {articleData ? '(Complete)' : '(Incomplete)'}
                </small>
                <small
                  className={victims.length > 0 ? 'text-success' : 'text-muted'}
                >
                  ✓ Victims ({victims.length})
                </small>
                <small
                  className={
                    perpetrators.length > 0 ? 'text-success' : 'text-muted'
                  }
                >
                  ✓ Perpetrators ({perpetrators.length})
                </small>
                <small className={typeOfMurder ? 'text-success' : 'text-muted'}>
                  ✓ Murder Type {typeOfMurder ? '(Complete)' : '(Incomplete)'}
                </small>
              </div>
            </Card.Body>
          </Card>

          {/* Step navigation */}
          <Card className="mb-4">
            <Card.Body>
              <div className="btn-group w-100" role="group">
                <button
                  type="button"
                  className={`btn ${currentStep === 1 ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setCurrentStep(1)}
                >
                  1. Article Info
                </button>
                <button
                  type="button"
                  className={`btn ${currentStep === 2 ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setCurrentStep(2)}
                  disabled={!articleData}
                >
                  2. Victims
                </button>
                <button
                  type="button"
                  className={`btn ${currentStep === 3 ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setCurrentStep(3)}
                  disabled={!articleData}
                >
                  3. Perpetrators
                </button>
                <button
                  type="button"
                  className={`btn ${currentStep === 4 ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setCurrentStep(4)}
                  disabled={!articleData || victims.length === 0}
                >
                  4. Final Details
                </button>
              </div>
            </Card.Body>
          </Card>

          {/* Step 1: Article Form */}
          {currentStep === 1 && (
            <ArticleForm
              onSubmit={handleSubmitArticleForm}
              initialData={articleData || undefined}
            />
          )}

          {/* Step 2: Victim Form */}
          {currentStep === 2 && (
            <VictimForm
              onSubmit={handleSubmitVictimForm}
              victims={victims}
              onClearVictims={handleClearVictims}
            />
          )}

          {/* Step 3: Perpetrator Form */}
          {currentStep === 3 && (
            <PerpetratorForm
              onSubmit={handleSubmitPerpetratorForm}
              perpetrators={perpetrators}
              onClearPerpetrators={handleClearPerpetrators}
            />
          )}

          {/* Step 4: Final Details and Submit */}
          {currentStep === 4 && (
            <Card className="mb-4">
              <Card.Header>
                <h4 className="mb-0">Final Details & Submit</h4>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <label className="form-label">Type of Murder *</label>
                    <select
                      className="form-select"
                      value={typeOfMurder}
                      onChange={(e) => setTypeOfMurder(e.target.value)}
                      required
                    >
                      {typeOfMurderOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </Col>
                </Row>

                {/* Summary */}
                {isReadyToSubmit && (
                  <Alert variant="success" className="mt-4">
                    <h5>Case Summary</h5>
                    <p>
                      <strong>Article:</strong>{' '}
                      {articleData?.newsReportHeadline}
                    </p>
                    <p>
                      <strong>Victims:</strong> {victims.length} victim(s)
                    </p>
                    <p>
                      <strong>Perpetrators:</strong> {perpetrators.length}{' '}
                      perpetrator(s)
                    </p>
                    {articleData?.newsReportPlatform && (
                      <p>
                        <strong>Platform:</strong>{' '}
                        {articleData.newsReportPlatform}
                      </p>
                    )}
                    <p>
                      <strong>Type of Murder:</strong> {typeOfMurder}
                    </p>
                    <p>
                      <strong>Date of Publication:</strong>{' '}
                      {articleData?.dateOfPublication}
                    </p>
                  </Alert>
                )}

                <div className="d-flex justify-content-end gap-2 mt-4">
                  <Button
                    variant="outline-primary"
                    onClick={() => setCurrentStep(3)}
                  >
                    Back to Perpetrators
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSubmitForm}
                    disabled={!isReadyToSubmit || loading}
                    size="lg"
                  >
                    {loading ? 'Saving...' : 'Save Homicide Case'}
                  </Button>
                </div>
              </Card.Body>
            </Card>
          )}

          {/* Navigation buttons for active steps */}
          {currentStep < 4 && (
            <Card>
              <Card.Body>
                <div className="d-flex justify-content-between">
                  <Button
                    variant="outline-secondary"
                    onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                    disabled={currentStep === 1}
                  >
                    Previous Step
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => {
                      if (currentStep === 1 && !articleData) {
                        toast.error('Please complete the article form first');
                        return;
                      }
                      if (currentStep === 2 && victims.length === 0) {
                        toast.error('Please add at least one victim first');
                        return;
                      }
                      setCurrentStep(Math.min(4, currentStep + 1));
                    }}
                    disabled={
                      (currentStep === 1 && !articleData) ||
                      (currentStep === 2 && victims.length === 0)
                    }
                  >
                    Next Step
                  </Button>
                </div>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default InputHomicide;
