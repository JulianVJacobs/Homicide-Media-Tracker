'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Card,
  Button,
  Row,
  Col,
  Navbar,
  Nav,
} from 'react-bootstrap';
import InputHomicide from '@/lib/components/input-homicide';
import ListHomicides from '@/lib/components/list-homicides';
import Settings from '@/lib/components/settings';

type Views = 'home' | 'input' | 'list' | 'settings';

export default function Home() {
  const [currentView, setCurrentView] = useState<Views>('home');

  const renderContent = () => {
    if (currentView === 'home') {
      return (
        <div className="text-center py-5">
          <div className="mb-4">
            <h1 className="display-3 fw-bold text-primary mb-3">
              NEWS REPORT TRACKER
            </h1>
            <p className="lead text-muted">
              Research tool for tracking and analysing news reports
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
                      Input New Event
                    </Button>
                    <Button
                      variant="outline-primary"
                      size="lg"
                      onClick={() => setCurrentView('list')}
                    >
                      View Events
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
      return <InputHomicide onBack={() => setCurrentView('home')} />;
    }

    if (currentView === 'list') {
      return <ListHomicides onBack={() => setCurrentView('home')} />;
    }

    if (currentView === 'settings') {
      return <Settings onBack={() => setCurrentView('home')} />;
    }
  };

  useEffect(() => {
    const onOpenSettings = () => setCurrentView('settings');
    if (typeof window !== 'undefined') {
      window.addEventListener(
        'open-settings',
        onOpenSettings as EventListener,
      );
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener(
          'open-settings',
          onOpenSettings as EventListener,
        );
      }
    };
  }, []);

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-0">
        <Container>
          <Navbar.Brand href="#" onClick={() => setCurrentView('home')}>
            News Report Tracker
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
                Input Event
              </Nav.Link>
              <Nav.Link
                href="#"
                onClick={() => setCurrentView('list')}
                className={currentView === 'list' ? 'active' : ''}
              >
                View All Events
              </Nav.Link>
              <Nav.Link
                href="#"
                onClick={() => setCurrentView('settings')}
                className={currentView === 'settings' ? 'active' : ''}
              >
                Settings
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="py-4">{renderContent()}</Container>
    </>
  );
}
