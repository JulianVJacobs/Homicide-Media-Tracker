'use client';

import { useState } from 'react';
import { Container, Card, Button, Row, Col, Navbar, Nav } from 'react-bootstrap';
import InputHomicide from '@/lib/components/input-homicide';
import ListHomicides from '@/lib/components/list-homicides';

export default function Home() {
  const [currentView, setCurrentView] = useState<'home' | 'input' | 'list'>('home');

  const renderContent = () => {
    if (currentView === 'home') {
      return (
        <div className="text-center py-5">
          <div className="mb-4">
            <h1 className="display-3 fw-bold text-primary mb-3">
              HOMICIDE MEDIA TRACKER
            </h1>
            <p className="lead text-muted">
              Research tool for tracking and analyzing homicide-related media coverage
            </p>
          </div>
          
          <Row className="justify-content-center">
            <Col md={8}>
              <Card className="shadow-sm">
                <Card.Body className="p-4">
                  <h3 className="mb-3">Quick Actions</h3>
                  <div className="d-grid gap-3">
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={() => setCurrentView('input')}
                    >
                      Input New Homicide Case
                    </Button>
                    <Button
                      variant="outline-primary"
                      size="lg"
                      onClick={() => setCurrentView('list')}
                    >
                      View Homicide Records
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>
      );
    }

    if (currentView === 'input') {
      return (
        <InputHomicide onBack={() => setCurrentView('home')} />
      );
    }

    if (currentView === 'list') {
      return (
        <ListHomicides onBack={() => setCurrentView('home')} />
      );
    }
  };

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-0">
        <Container>
          <Navbar.Brand href="#" onClick={() => setCurrentView('home')}>
            Homicide Media Tracker
          </Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse>
            <Nav className="me-auto">
              <Nav.Link 
                href="#" 
                onClick={() => setCurrentView('home')}
                className={currentView === 'home' ? 'active' : ''}
              >
                Home
              </Nav.Link>
              <Nav.Link 
                href="#" 
                onClick={() => setCurrentView('input')}
                className={currentView === 'input' ? 'active' : ''}
              >
                Input Cases
              </Nav.Link>
              <Nav.Link 
                href="#" 
                onClick={() => setCurrentView('list')}
                className={currentView === 'list' ? 'active' : ''}
              >
                View Records
              </Nav.Link>
              <Nav.Link 
                href="/sys-info"
              >
                System Information
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="py-4">
        {renderContent()}
      </Container>
    </>
  );
}
