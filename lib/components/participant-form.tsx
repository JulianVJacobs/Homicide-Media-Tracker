'use client';

import React, { useMemo, useState } from 'react';
import { Alert, Button, Card, Col, Form, ListGroup, Row } from 'react-bootstrap';
import VictimForm, { type VictimFormValues } from './victim-form';
import PerpetratorForm, { type PerpetratorFormValues } from './perpetrator-form';
import {
  PARTICIPANT_FORM_VISIBLE_FIELD_GROUPS,
  type ParticipantType,
} from '@/lib/contracts/participant-form';

export interface OtherParticipantFormValues {
  participantName: string;
  participantAlias: string;
}

interface ParticipantFormProps {
  onSubmitVictim: (data: VictimFormValues) => void;
  onSubmitPerpetrator: (data: PerpetratorFormValues) => void;
  onSubmitOther: (data: OtherParticipantFormValues) => void;
  victims: VictimFormValues[];
  perpetrators: PerpetratorFormValues[];
  otherParticipants: OtherParticipantFormValues[];
  onClearVictims: () => void;
  onClearPerpetrators: () => void;
  onClearOtherParticipants: () => void;
}

const ParticipantForm: React.FC<ParticipantFormProps> = ({
  onSubmitVictim,
  onSubmitPerpetrator,
  onSubmitOther,
  victims,
  perpetrators,
  otherParticipants,
  onClearVictims,
  onClearPerpetrators,
  onClearOtherParticipants,
}) => {
  const [participantType, setParticipantType] = useState<ParticipantType>('victim');
  const [otherForm, setOtherForm] = useState<OtherParticipantFormValues>({
    participantName: '',
    participantAlias: '',
  });

  const otherIsValid = useMemo(
    () => Boolean(otherForm.participantName.trim()),
    [otherForm.participantName],
  );
  const visibleFieldGroups = PARTICIPANT_FORM_VISIBLE_FIELD_GROUPS[participantType];

  return (
    <>
      <Card className="mb-4">
        <Card.Header>
          <h4 className="mb-0">Participant Type</h4>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-0">
                <Form.Label>Select Participant Profile</Form.Label>
                <Form.Select
                  value={participantType}
                  onChange={(e) => setParticipantType(e.target.value as ParticipantType)}
                >
                  <option value="victim">Victim</option>
                  <option value="perpetrator">Perpetrator</option>
                  <option value="other">Other</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {participantType === 'victim' && visibleFieldGroups.includes('deathDetails') && (
        <VictimForm
          onSubmit={onSubmitVictim}
          victims={victims}
          onClearVictims={onClearVictims}
        />
      )}

      {participantType === 'perpetrator' &&
        visibleFieldGroups.includes('suspectStatus') && (
        <PerpetratorForm
          onSubmit={onSubmitPerpetrator}
          perpetrators={perpetrators}
          onClearPerpetrators={onClearPerpetrators}
        />
      )}

      {participantType === 'other' && visibleFieldGroups.includes('coreIdentity') && (
        <Card className="mb-4">
          <Card.Header>
            <div className="d-flex justify-content-between align-items-center">
              <h4 className="mb-0">Other Participant Information</h4>
              {otherParticipants.length > 0 && (
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={onClearOtherParticipants}
                >
                  Clear All Others
                </Button>
              )}
            </div>
          </Card.Header>
          <Card.Body>
            {otherParticipants.length > 0 && (
              <Alert variant="info" className="mb-3">
                <strong>{otherParticipants.length} other participant(s) added:</strong>
                <ListGroup variant="flush" className="mt-2">
                  {otherParticipants.map((participant, index) => (
                    <ListGroup.Item key={index} className="px-0">
                      <strong>{participant.participantName}</strong>
                      {participant.participantAlias
                        ? ` - ${participant.participantAlias}`
                        : ''}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Alert>
            )}

            <Form>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Participant Name *</Form.Label>
                    <Form.Control
                      type="text"
                      value={otherForm.participantName}
                      onChange={(e) =>
                        setOtherForm((prev) => ({
                          ...prev,
                          participantName: e.target.value,
                        }))
                      }
                      placeholder="Full name"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Alias</Form.Label>
                    <Form.Control
                      type="text"
                      value={otherForm.participantAlias}
                      onChange={(e) =>
                        setOtherForm((prev) => ({
                          ...prev,
                          participantAlias: e.target.value,
                        }))
                      }
                      placeholder="Known alias/nickname"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <div className="d-flex justify-content-end">
                <Button
                  variant="primary"
                  onClick={() => {
                    if (!otherIsValid) return;
                    onSubmitOther(otherForm);
                    setOtherForm({ participantName: '', participantAlias: '' });
                  }}
                  disabled={!otherIsValid}
                >
                  Add Other Participant
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      )}
    </>
  );
};

export default ParticipantForm;
