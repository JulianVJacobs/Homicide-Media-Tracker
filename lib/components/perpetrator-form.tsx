'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Button,
  Row,
  Col,
  Alert,
  ListGroup,
} from 'react-bootstrap';
import { PerpetratorData } from '@/lib/types/homicide';

interface PerpetratorFormProps {
  onSubmit: (data: PerpetratorData) => void;
  perpetrators: PerpetratorData[];
  onClearPerpetrators: () => void;
}

const PerpetratorForm: React.FC<PerpetratorFormProps> = ({
  onSubmit,
  perpetrators = [],
  onClearPerpetrators,
}) => {
  const [currentPerpetrator, setCurrentPerpetrator] = useState<PerpetratorData>(
    {
      perpetratorName: '',
      relationshipToVictim: '',
      suspectIdentified: '',
      suspectArrested: '',
      suspectCharged: '',
      conviction: '',
      sentence: '',
    },
  );

  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    // Validate required fields - only perpetrator name is required
    const allRequiredFilled = currentPerpetrator.perpetratorName.trim() !== '';
    setIsValid(allRequiredFilled);
  }, [currentPerpetrator]);

  const handleChange = (field: keyof PerpetratorData, value: string) => {
    setCurrentPerpetrator((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddPerpetrator = () => {
    if (isValid) {
      onSubmit(currentPerpetrator);

      // Reset form
      setCurrentPerpetrator({
        perpetratorName: '',
        relationshipToVictim: '',
        suspectIdentified: '',
        suspectArrested: '',
        suspectCharged: '',
        conviction: '',
        sentence: '',
      });
    }
  };

  const relationshipOptions = [
    { value: '', label: 'Select Relationship' },
    { value: 'Spouse/Partner', label: 'Spouse/Partner' },
    { value: 'Ex-Spouse/Ex-Partner', label: 'Ex-Spouse/Ex-Partner' },
    { value: 'Family Member', label: 'Family Member' },
    { value: 'Friend', label: 'Friend' },
    { value: 'Acquaintance', label: 'Acquaintance' },
    { value: 'Stranger', label: 'Stranger' },
    { value: 'Unknown', label: 'Unknown' },
    { value: 'Other', label: 'Other' },
  ];

  const yesNoOptions = [
    { value: '', label: 'Select' },
    { value: 'Yes', label: 'Yes' },
    { value: 'No', label: 'No' },
    { value: 'Unknown', label: 'Unknown' },
  ];

  const convictionOptions = [
    { value: '', label: 'Select' },
    { value: 'Guilty', label: 'Guilty' },
    { value: 'Not Guilty', label: 'Not Guilty' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Unknown', label: 'Unknown' },
    { value: 'Not Applicable', label: 'Not Applicable' },
  ];

  return (
    <Card className="mb-4">
      <Card.Header>
        <div className="d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Perpetrator Information</h4>
          {Array.isArray(perpetrators) && perpetrators.length > 0 && (
            <Button
              variant="outline-danger"
              size="sm"
              onClick={onClearPerpetrators}
            >
              Clear All Perpetrators
            </Button>
          )}
        </div>
      </Card.Header>
      <Card.Body>
        {Array.isArray(perpetrators) && perpetrators.length > 0 && (
          <Alert variant="info" className="mb-3">
            <strong>{perpetrators.length} perpetrator(s) added:</strong>
            <ListGroup variant="flush" className="mt-2">
              {perpetrators.map((perpetrator, index) => (
                <ListGroup.Item key={index} className="px-0">
                  <strong>{perpetrator.perpetratorName}</strong>
                  {perpetrator.relationshipToVictim &&
                    ` - ${perpetrator.relationshipToVictim}`}
                  {perpetrator.suspectArrested &&
                    ` | Arrested: ${perpetrator.suspectArrested}`}
                  {perpetrator.conviction &&
                    ` | Conviction: ${perpetrator.conviction}`}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Alert>
        )}

        <Form>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Perpetrator Name *</Form.Label>
                <Form.Control
                  type="text"
                  value={currentPerpetrator.perpetratorName}
                  onChange={(e) =>
                    handleChange('perpetratorName', e.target.value)
                  }
                  placeholder="Full name or 'Unknown' if not identified"
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Relationship to Victim</Form.Label>
                <Form.Select
                  value={currentPerpetrator.relationshipToVictim}
                  onChange={(e) =>
                    handleChange('relationshipToVictim', e.target.value)
                  }
                >
                  {relationshipOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Suspect Identified</Form.Label>
                <Form.Select
                  value={currentPerpetrator.suspectIdentified}
                  onChange={(e) =>
                    handleChange('suspectIdentified', e.target.value)
                  }
                >
                  {yesNoOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Suspect Arrested</Form.Label>
                <Form.Select
                  value={currentPerpetrator.suspectArrested}
                  onChange={(e) =>
                    handleChange('suspectArrested', e.target.value)
                  }
                >
                  {yesNoOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Suspect Charged</Form.Label>
                <Form.Select
                  value={currentPerpetrator.suspectCharged}
                  onChange={(e) =>
                    handleChange('suspectCharged', e.target.value)
                  }
                >
                  {yesNoOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Conviction</Form.Label>
                <Form.Select
                  value={currentPerpetrator.conviction}
                  onChange={(e) => handleChange('conviction', e.target.value)}
                >
                  {convictionOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Sentence</Form.Label>
                <Form.Control
                  type="text"
                  value={currentPerpetrator.sentence}
                  onChange={(e) => handleChange('sentence', e.target.value)}
                  placeholder="e.g., Life imprisonment, 15 years, etc."
                />
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex justify-content-end">
            <Button
              variant="primary"
              onClick={handleAddPerpetrator}
              disabled={!isValid}
            >
              Add Perpetrator
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default PerpetratorForm;
