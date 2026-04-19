'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Container,
  Form,
  Modal,
  Row,
} from 'react-bootstrap';
import { toast } from 'react-toastify';
import type { Perpetrator, Victim } from '@/lib/db/schema';
import {
  buildAliasPromotionResult,
  buildMergeQueueCandidates,
  buildMergeResult,
  splitAliasValues,
  type MergeParticipantRecord,
  type MergeQueueCandidate,
} from './participant-merge-queue.utils';
import { getBaseUrl } from '../platform';

interface ParticipantMergeQueueProps {
  onBack: () => void;
}

type MergeKeepSide = 'left' | 'right';

const toParticipantRecords = (
  victims: Victim[],
  perpetrators: Perpetrator[],
): MergeParticipantRecord[] => [
  ...victims.map((victim) => ({
    id: victim.id,
    role: 'victim' as const,
    articleId: victim.articleId,
    primaryName: victim.victimName,
    alias: victim.victimAlias,
  })),
  ...perpetrators.map((perpetrator) => ({
    id: perpetrator.id,
    role: 'perpetrator' as const,
    articleId: perpetrator.articleId,
    primaryName: perpetrator.perpetratorName,
    alias: perpetrator.perpetratorAlias,
  })),
];

const prettyRole = (role: MergeParticipantRecord['role']) =>
  role === 'victim' ? 'Victim' : 'Perpetrator';

const ParticipantMergeQueue: React.FC<ParticipantMergeQueueProps> = ({ onBack }) => {
  const [victims, setVictims] = useState<Victim[]>([]);
  const [perpetrators, setPerpetrators] = useState<Perpetrator[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [selectedCandidate, setSelectedCandidate] =
    useState<MergeQueueCandidate | null>(null);
  const [mergeKeepSide, setMergeKeepSide] = useState<MergeKeepSide>('left');

  const [promotionTarget, setPromotionTarget] =
    useState<MergeParticipantRecord | null>(null);
  const [promotionValue, setPromotionValue] = useState('');
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  const participants = useMemo(
    () => toParticipantRecords(victims, perpetrators),
    [victims, perpetrators],
  );
  const queue = useMemo(
    () => buildMergeQueueCandidates(participants),
    [participants],
  );

  const refreshParticipants = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [{ get: getVictims }, { get: getPerpetrators }] = await Promise.all([
        import('@/app/api/victims/offline'),
        import('@/app/api/perpetrators/offline'),
      ]);

      const [victimsResponse, perpetratorsResponse] = await Promise.all([
        getVictims(new Request(`${getBaseUrl()}?limit=2000`)),
        getPerpetrators(new Request(`${getBaseUrl()}?limit=2000`)),
      ]);

      if (!victimsResponse.success) {
        throw new Error(victimsResponse.error || 'Failed to load victims');
      }
      if (!perpetratorsResponse.success) {
        throw new Error(
          perpetratorsResponse.error || 'Failed to load perpetrators',
        );
      }

      setVictims(Array.isArray(victimsResponse.data) ? victimsResponse.data : []);
      setPerpetrators(
        Array.isArray(perpetratorsResponse.data) ? perpetratorsResponse.data : [],
      );
    } catch (fetchError) {
      const message =
        fetchError instanceof Error
          ? fetchError.message
          : 'Failed to load participant merge queue';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshParticipants();
  }, [refreshParticipants]);

  const runParticipantUpdate = useCallback(
    async (
      participant: MergeParticipantRecord,
      updates: { primaryName: string | null; alias: string | null },
    ) => {
      if (participant.role === 'victim') {
        const victim = victims.find((item) => item.id === participant.id);
        if (!victim) throw new Error('Victim record not found');
        const { put: updateVictim } = await import('@/app/api/victims/offline');
        const response = await updateVictim(
          new Request(getBaseUrl(), {
            method: 'PUT',
            body: JSON.stringify({
              ...victim,
              victimName: updates.primaryName,
              victimAlias: updates.alias,
            }),
          }),
        );
        if (!response.success) {
          throw new Error(response.error || response.message || 'Victim update failed');
        }
        return;
      }

      const perpetrator = perpetrators.find((item) => item.id === participant.id);
      if (!perpetrator) throw new Error('Perpetrator record not found');
      const { put: updatePerpetrator } = await import(
        '@/app/api/perpetrators/offline'
      );
      const response = await updatePerpetrator(
        new Request(getBaseUrl(), {
          method: 'PUT',
          body: JSON.stringify({
            ...perpetrator,
            perpetratorName: updates.primaryName,
            perpetratorAlias: updates.alias,
          }),
        }),
      );
      if (!response.success) {
        throw new Error(
          response.error || response.message || 'Perpetrator update failed',
        );
      }
    },
    [perpetrators, victims],
  );

  const runParticipantDelete = useCallback(
    async (participant: MergeParticipantRecord) => {
      if (participant.role === 'victim') {
        const { del: deleteVictim } = await import('@/app/api/victims/offline');
        const response = await deleteVictim(
          new Request(`${getBaseUrl()}?id=${participant.id}`, { method: 'DELETE' }),
        );
        if (!response.success) {
          throw new Error(response.error || response.message || 'Victim delete failed');
        }
        return;
      }

      const { del: deletePerpetrator } = await import(
        '@/app/api/perpetrators/offline'
      );
      const response = await deletePerpetrator(
        new Request(`${getBaseUrl()}?id=${participant.id}`, { method: 'DELETE' }),
      );
      if (!response.success) {
        throw new Error(
          response.error || response.message || 'Perpetrator delete failed',
        );
      }
    },
    [],
  );

  const handleConfirmPromotion = async () => {
    if (!promotionTarget) return;
    try {
      setValidationMessage(null);
      const result = buildAliasPromotionResult(promotionTarget, promotionValue);
      setBusy(true);
      await runParticipantUpdate(promotionTarget, result);
      toast.success('Alias promoted to primary name.');
      setPromotionTarget(null);
      setPromotionValue('');
      await refreshParticipants();
    } catch (actionError) {
      const message =
        actionError instanceof Error
          ? actionError.message
          : 'Failed to promote alias';
      setValidationMessage(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  const handleConfirmMerge = async () => {
    if (!selectedCandidate) return;
    try {
      setValidationMessage(null);
      setBusy(true);
      const keep =
        mergeKeepSide === 'left'
          ? selectedCandidate.left
          : selectedCandidate.right;
      const remove =
        mergeKeepSide === 'left'
          ? selectedCandidate.right
          : selectedCandidate.left;
      const result = buildMergeResult(keep, remove);
      await runParticipantUpdate(keep, result);
      await runParticipantDelete(remove);
      toast.success('Participants merged successfully.');
      setSelectedCandidate(null);
      await refreshParticipants();
    } catch (actionError) {
      const message =
        actionError instanceof Error ? actionError.message : 'Failed to merge';
      setValidationMessage(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Participant Merge Queue</h2>
            <div>
              <Button
                variant="outline-primary"
                className="me-2"
                onClick={refreshParticipants}
                disabled={loading || busy}
              >
                Refresh
              </Button>
              <Button variant="outline-secondary" onClick={onBack}>
                Back to Home
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="danger">
              <strong>Error:</strong> {error}
            </Alert>
          )}

          <Card className="mb-4">
            <Card.Body>
              <div className="d-flex gap-4">
                <div>
                  <strong>Participants:</strong> {participants.length}
                </div>
                <div>
                  <strong>Queue Items:</strong> {queue.length}
                </div>
              </div>
            </Card.Body>
          </Card>

          {loading ? (
            <Card>
              <Card.Body className="text-center py-5">Loading merge queue...</Card.Body>
            </Card>
          ) : queue.length === 0 ? (
            <Alert variant="info">
              No merge candidates found. Queue updates automatically after alias
              changes and merges.
            </Alert>
          ) : (
            queue.map((candidate) => (
              <Card className="mb-3" key={candidate.id}>
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <div>
                    Potential duplicate <Badge bg="warning">{candidate.sharedValue}</Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="outline-primary"
                    onClick={() => {
                      setMergeKeepSide('left');
                      setValidationMessage(null);
                      setSelectedCandidate(candidate);
                    }}
                    disabled={busy}
                  >
                    Merge Participants
                  </Button>
                </Card.Header>
                <Card.Body>
                  <Row>
                    {[candidate.left, candidate.right].map((participant) => (
                      <Col md={6} key={participant.id}>
                        <Card>
                          <Card.Body>
                            <div className="mb-2">
                              <Badge bg="secondary" className="me-2">
                                {prettyRole(participant.role)}
                              </Badge>
                              <small className="text-muted">ID: {participant.id}</small>
                            </div>
                            <p className="mb-1">
                              <strong>Primary:</strong>{' '}
                              {participant.primaryName || (
                                <span className="text-muted">No primary name</span>
                              )}
                            </p>
                            <p className="mb-3">
                              <strong>Aliases:</strong>{' '}
                              {participant.alias || (
                                <span className="text-muted">No aliases</span>
                              )}
                            </p>
                            <Button
                              size="sm"
                              variant="outline-secondary"
                              onClick={() => {
                                setValidationMessage(null);
                                setPromotionTarget(participant);
                                setPromotionValue('');
                              }}
                              disabled={busy || splitAliasValues(participant.alias).length === 0}
                            >
                              Promote Alias
                            </Button>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </Card.Body>
              </Card>
            ))
          )}
        </Col>
      </Row>

      <Modal show={Boolean(selectedCandidate)} onHide={() => setSelectedCandidate(null)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Participant Merge</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCandidate && (
            <>
              <p className="mb-3">
                Choose which participant record to keep. The removed participant&apos;s
                primary name and aliases will be appended as aliases on the kept
                record.
              </p>
              <Form>
                <Form.Check
                  type="radio"
                  id="merge-keep-left"
                  name="mergeKeepSide"
                  checked={mergeKeepSide === 'left'}
                  onChange={() => setMergeKeepSide('left')}
                  label={`Keep ${selectedCandidate.left.primaryName || selectedCandidate.left.id}`}
                  className="mb-2"
                />
                <Form.Check
                  type="radio"
                  id="merge-keep-right"
                  name="mergeKeepSide"
                  checked={mergeKeepSide === 'right'}
                  onChange={() => setMergeKeepSide('right')}
                  label={`Keep ${selectedCandidate.right.primaryName || selectedCandidate.right.id}`}
                />
              </Form>
            </>
          )}
          {validationMessage && <Alert variant="danger" className="mt-3">{validationMessage}</Alert>}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setSelectedCandidate(null)}
            disabled={busy}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConfirmMerge} disabled={busy}>
            {busy ? 'Merging...' : 'Confirm Merge'}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={Boolean(promotionTarget)} onHide={() => setPromotionTarget(null)}>
        <Modal.Header closeButton>
          <Modal.Title>Promote Alias to Primary Name</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {promotionTarget && (
            <>
              <p>
                Select an alias for <strong>{promotionTarget.primaryName}</strong>.
                The previous primary name will be retained as an alias.
              </p>
              <Form.Group>
                <Form.Label>Alias to promote</Form.Label>
                <Form.Select
                  value={promotionValue}
                  onChange={(event) => {
                    setValidationMessage(null);
                    setPromotionValue(event.target.value);
                  }}
                >
                  <option value="">Select alias</option>
                  {splitAliasValues(promotionTarget.alias).map((alias) => (
                    <option key={alias} value={alias}>
                      {alias}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </>
          )}
          {validationMessage && <Alert variant="danger" className="mt-3">{validationMessage}</Alert>}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setPromotionTarget(null)}
            disabled={busy}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirmPromotion}
            disabled={busy}
          >
            {busy ? 'Updating...' : 'Confirm Promotion'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ParticipantMergeQueue;
