'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Card,
  Table,
  Button,
  Alert,
  Form,
  Row,
  Col,
  Badge,
  Modal,
} from 'react-bootstrap';
import { toast } from 'react-toastify';
import { HomicideCase, ApiResponse } from '@/lib/types/homicide';

interface ListHomicidesProps {
  onBack: () => void;
}

const ListHomicides: React.FC<ListHomicidesProps> = ({ onBack }) => {
  const [cases, setCases] = useState<HomicideCase[]>([]);
  // Defensive: never set to undefined/null
  // Defensive helpers for victims/perpetrators arrays
  const getVictimsLength = (case_: HomicideCase) =>
    Array.isArray(case_?.victims) ? case_.victims.length : 0;
  const getPerpetratorsLength = (case_: HomicideCase) =>
    Array.isArray(case_?.perpetrators) ? case_.perpetrators.length : 0;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCases, setTotalCases] = useState(0);
  const [selectedCase, setSelectedCase] = useState<HomicideCase | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchCases();
  }, [currentPage, searchTerm]);

  const fetchCases = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await fetch(`/api/events?${params}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<any> = await response.json();

      if (result.success && result.data) {
        const events = Array.isArray(result.data.events)
          ? result.data.events
          : [];
        // For each event, fetch related data and assemble full case
        const assembledCases = await Promise.all(
          events.map(async (event: any) => {
            // Fetch article
            let articleData = null;
            if (
              Array.isArray(event.articleIds) &&
              event.articleIds.length > 0
            ) {
              try {
                const res = await fetch(
                  `/api/articles?id=${event.articleIds[0]}`,
                );
                if (res.ok) {
                  const articleRes = await res.json();
                  articleData = articleRes.data || null;
                }
              } catch {}
            }
            // Fetch victims
            let victims = [];
            if (Array.isArray(event.participantIds)) {
              for (const pid of event.participantIds) {
                try {
                  const res = await fetch(`/api/victims?id=${pid}`);
                  if (res.ok) {
                    const victimRes = await res.json();
                    if (victimRes.data) victims.push(victimRes.data);
                  }
                } catch {}
              }
            }
            // Fetch perpetrators
            let perpetrators = [];
            if (Array.isArray(event.participantIds)) {
              for (const pid of event.participantIds) {
                try {
                  const res = await fetch(`/api/perpetrators?id=${pid}`);
                  if (res.ok) {
                    const perpRes = await res.json();
                    if (perpRes.data) perpetrators.push(perpRes.data);
                  }
                } catch {}
              }
            }
            return {
              id: event.id,
              articleData,
              victims,
              perpetrators,
              typeOfMurder: event.details?.typeOfMurder || '',
              createdAt: event.createdAt,
              updatedAt: event.updatedAt,
            };
          }),
        );
        setCases(assembledCases);
        setTotalPages(result.data.totalPages || 1);
        setTotalCases(result.data.total || 0);
      } else {
        throw new Error(result.error || 'Failed to fetch cases');
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch homicide cases',
      );
      toast.error('Failed to load homicide cases');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchCases();
  };

  const handleDeleteCase = async (caseId: string) => {
    if (!window.confirm('Are you sure you want to delete this case?')) {
      return;
    }

    try {
      const response = await fetch(`/api/events?id=${caseId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete case');
      }

      toast.success('Case deleted successfully');
      fetchCases();
    } catch (err) {
      toast.error('Failed to delete case');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const showCaseDetails = (case_: HomicideCase) => {
    setSelectedCase(case_);
    setShowDetailModal(true);
  };

  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Homicide Records</h2>
            <Button variant="outline-secondary" onClick={onBack}>
              Back to Home
            </Button>
          </div>

          {/* Search and Stats */}
          <Card className="mb-4">
            <Card.Body>
              <Form onSubmit={handleSearch}>
                <Row>
                  <Col md={8}>
                    <Form.Control
                      type="text"
                      placeholder="Search cases by headline, source, victim name, province, or murder type..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </Col>
                  <Col md={4}>
                    <Button type="submit" variant="primary" disabled={loading}>
                      {loading ? 'Searching...' : 'Search'}
                    </Button>
                    <Button
                      variant="outline-secondary"
                      className="ms-2"
                      onClick={() => {
                        setSearchTerm('');
                        setCurrentPage(1);
                        fetchCases();
                      }}
                    >
                      Clear
                    </Button>
                  </Col>
                </Row>
              </Form>
              <div className="mt-3">
                <small className="text-muted">
                  Showing {Array.isArray(cases) ? cases.length : 0} of{' '}
                  {totalCases} total cases
                </small>
              </div>
            </Card.Body>
          </Card>

          {/* Error Alert */}
          {error && (
            <Alert variant="danger" className="mb-4">
              <strong>Error:</strong> {error}
              <Button
                variant="outline-danger"
                size="sm"
                className="ms-2"
                onClick={fetchCases}
              >
                Retry
              </Button>
            </Alert>
          )}

          {/* Cases Table */}
          <Card>
            <Card.Header>
              <h5 className="mb-0">Homicide Cases</h5>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Loading cases...</p>
                </div>
              ) : cases.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted">
                    {searchTerm
                      ? 'No cases found matching your search.'
                      : 'No homicide cases recorded yet.'}
                  </p>
                </div>
              ) : (
                <>
                  <div className="table-responsive">
                    <Table striped hover>
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Headline</th>
                          <th>Source</th>
                          <th>Victims</th>
                          <th>Murder Type</th>
                          <th>Province</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.isArray(cases) &&
                          cases.map((case_) => (
                            <tr key={case_.id}>
                              <td>
                                {case_.articleData &&
                                case_.articleData.dateOfPublication ? (
                                  formatDate(
                                    case_.articleData.dateOfPublication,
                                  )
                                ) : (
                                  <span className="text-muted">N/A</span>
                                )}
                              </td>
                              <td>
                                <div
                                  className="text-truncate"
                                  style={{ maxWidth: '200px' }}
                                >
                                  {case_.articleData &&
                                  case_.articleData.newsReportHeadline ? (
                                    case_.articleData.newsReportHeadline
                                  ) : (
                                    <span className="text-muted">N/A</span>
                                  )}
                                </div>
                              </td>
                              <td>
                                {case_.articleData &&
                                case_.articleData.newsSource ? (
                                  case_.articleData.newsSource
                                ) : (
                                  <span className="text-muted">N/A</span>
                                )}
                              </td>
                              <td>
                                <Badge bg="info">
                                  {getVictimsLength(case_)}
                                </Badge>
                                {getVictimsLength(case_) === 1 &&
                                  Array.isArray(case_.victims) && (
                                    <div className="small text-muted">
                                      {case_.victims[0]?.victimName}
                                    </div>
                                  )}
                              </td>
                              <td>
                                <Badge bg="secondary" className="small">
                                  {case_.typeOfMurder}
                                </Badge>
                              </td>
                              <td>
                                {getVictimsLength(case_) > 0 &&
                                  Array.isArray(case_.victims) &&
                                  case_.victims[0]?.province}
                              </td>
                              <td>
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  className="me-1"
                                  onClick={() => showCaseDetails(case_)}
                                >
                                  View
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleDeleteCase(case_.id!)}
                                >
                                  Delete
                                </Button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="d-flex justify-content-center mt-4">
                      <Button
                        variant="outline-primary"
                        onClick={() =>
                          setCurrentPage(Math.max(1, currentPage - 1))
                        }
                        disabled={currentPage === 1}
                        className="me-2"
                      >
                        Previous
                      </Button>
                      <span className="align-self-center mx-3">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline-primary"
                        onClick={() =>
                          setCurrentPage(Math.min(totalPages, currentPage + 1))
                        }
                        disabled={currentPage === totalPages}
                        className="ms-2"
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Detail Modal */}
      <Modal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Case Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCase && (
            <div>
              <h5>Article Information</h5>
              <p>
                <strong>Headline:</strong>{' '}
                {selectedCase.articleData.newsReportHeadline}
              </p>
              <p>
                <strong>Source:</strong> {selectedCase.articleData.newsSource}
              </p>
              <p>
                <strong>Date:</strong>{' '}
                {formatDate(selectedCase.articleData.dateOfPublication)}
              </p>
              <p>
                <strong>URL:</strong>{' '}
                <a
                  href={selectedCase.articleData.newsReportUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Article
                </a>
              </p>
              {selectedCase.articleData.author && (
                <p>
                  <strong>Author:</strong> {selectedCase.articleData.author}
                </p>
              )}

              <h5 className="mt-4">
                Victims (
                {Array.isArray(selectedCase?.victims)
                  ? selectedCase.victims.length
                  : 0}
                )
              </h5>
              {Array.isArray(selectedCase?.victims) &&
                selectedCase.victims.map((victim, index) => (
                  <Card key={index} className="mb-2">
                    <Card.Body>
                      <h6>{victim.victimName}</h6>
                      <p className="mb-1">
                        <strong>Gender:</strong> {victim.genderOfVictim}
                      </p>
                      <p className="mb-1">
                        <strong>Age:</strong>{' '}
                        {victim.ageOfVictim || victim.ageRangeOfVictim}
                      </p>
                      <p className="mb-1">
                        <strong>Location:</strong> {victim.town},{' '}
                        {victim.province}
                      </p>
                      <p className="mb-1">
                        <strong>Date of Death:</strong>{' '}
                        {formatDate(victim.dateOfDeath)}
                      </p>
                      {victim.modeOfDeathGeneral && (
                        <p className="mb-1">
                          <strong>Mode of Death:</strong>{' '}
                          {victim.modeOfDeathGeneral}
                        </p>
                      )}
                    </Card.Body>
                  </Card>
                ))}

              <h5 className="mt-4">
                Perpetrators (
                {Array.isArray(selectedCase?.perpetrators)
                  ? selectedCase.perpetrators.length
                  : 0}
                )
              </h5>
              {Array.isArray(selectedCase?.perpetrators) &&
                selectedCase.perpetrators.map((perpetrator, index) => (
                  <Card key={index} className="mb-2">
                    <Card.Body>
                      <h6>{perpetrator.perpetratorName}</h6>
                      {perpetrator.relationshipToVictim && (
                        <p className="mb-1">
                          <strong>Relationship:</strong>{' '}
                          {perpetrator.relationshipToVictim}
                        </p>
                      )}
                      <p className="mb-1">
                        <strong>Arrested:</strong>{' '}
                        {perpetrator.suspectArrested || 'Unknown'}
                      </p>
                      <p className="mb-1">
                        <strong>Charged:</strong>{' '}
                        {perpetrator.suspectCharged || 'Unknown'}
                      </p>
                      {perpetrator.conviction && (
                        <p className="mb-1">
                          <strong>Conviction:</strong> {perpetrator.conviction}
                        </p>
                      )}
                      {perpetrator.sentence && (
                        <p className="mb-1">
                          <strong>Sentence:</strong> {perpetrator.sentence}
                        </p>
                      )}
                    </Card.Body>
                  </Card>
                ))}

              <h5 className="mt-4">Case Information</h5>
              <p>
                <strong>Type of Murder:</strong> {selectedCase.typeOfMurder}
              </p>
              <p>
                <strong>Created:</strong>{' '}
                {selectedCase.createdAt && formatDate(selectedCase.createdAt)}
              </p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ListHomicides;
