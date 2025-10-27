'use client';

import React, { useEffect, useState } from 'react';
import {
  Container,
  Button,
  Row,
  Col,
  ListGroup,
  Card,
  Form,
} from 'react-bootstrap';
import SyncConfiguration from '@/lib/components/sync-configuration';
import {
  getStoredDirectoryHandle,
  storeDirectoryHandle,
  removeStoredDirectoryHandle,
} from '@/lib/utils/fs-utils';

interface SettingsProps {
  onBack: () => void;
}

export default function Settings({ onBack }: SettingsProps) {
  const [active, setActive] = useState<'backup' | 'sync'>('backup');
  const [backupDirLabel, setBackupDirLabel] = useState<string | null>(null);
  const [hasBackupDir, setHasBackupDir] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const h = await getStoredDirectoryHandle('backup-folder');
        if (h) {
          setHasBackupDir(true);
          setBackupDirLabel(h.name || 'backup-folder');
        }
      } catch (err) {
        // ignore
      }
    })();
  }, []);

  const handlePickBackupFolder = async () => {
    const w = window as unknown as Window & {
      showDirectoryPicker?: () => Promise<FileSystemDirectoryHandle>;
    };
    if (!w.showDirectoryPicker) {
      setMessage('Directory Picker not supported in this browser');
      return;
    }
    try {
      const handle = await w.showDirectoryPicker();
      await storeDirectoryHandle('backup-folder', handle);
      setBackupDirLabel(handle.name || 'backup-folder');
      setHasBackupDir(true);
      setMessage('Backup folder saved');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Folder pick failed', err);
      setMessage('Folder pick cancelled or failed');
    }
  };

  const handleClearBackup = async () => {
    try {
      await removeStoredDirectoryHandle('backup-folder');
      setHasBackupDir(false);
      setBackupDirLabel(null);
      setMessage('Cleared backup folder');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to clear folder handle', err);
      setMessage('Failed to clear folder handle');
    }
  };

  return (
    <Container className="py-4">
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Settings</h2>
            <Button variant="outline-secondary" onClick={onBack}>
              Back to Home
            </Button>
          </div>
        </Col>
      </Row>

      <Row>
        <Col md={3} className="pe-4">
          <ListGroup>
            <ListGroup.Item
              action
              active={active === 'backup'}
              onClick={() => setActive('backup')}
            >
              Backup
            </ListGroup.Item>
            <ListGroup.Item
              action
              active={active === 'sync'}
              onClick={() => setActive('sync')}
            >
              Sync
            </ListGroup.Item>
          </ListGroup>
        </Col>

        <Col md={9}>
          {active === 'backup' && (
            <Card className="mb-3">
              <Card.Body>
                <Card.Title>Backup</Card.Title>
                <Form.Group className="mb-3">
                  <Form.Label>Folder</Form.Label>
                  <div
                    style={{ display: 'flex', gap: 8, alignItems: 'center' }}
                  >
                    <Form.Control
                      readOnly
                      value={hasBackupDir ? (backupDirLabel ?? '') : ''}
                      placeholder={
                        hasBackupDir
                          ? ''
                          : ((): string => {
                              const appName = 'Homicide Media Tracker';
                              const ua =
                                typeof navigator !== 'undefined'
                                  ? navigator.userAgent
                                  : '';
                              if (/Win/i.test(ua)) {
                                return `%USERPROFILE%\\Documents\\${appName} Backups`;
                              }
                              return `~/Documents/${appName} Backups`;
                            })()
                      }
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={handlePickBackupFolder}
                    >
                      Select backup folder
                    </Button>
                    {hasBackupDir && (
                      <Button
                        variant="outline-danger"
                        onClick={handleClearBackup}
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                  <Form.Text className="text-muted">
                    This browser does not support automatic file syncing. All
                    backups will need to be done manually unless you use the
                    packaged app.
                  </Form.Text>
                </Form.Group>
                {message && <div className="mt-2">{message}</div>}
              </Card.Body>
            </Card>
          )}

          {active === 'sync' && (
            <Card>
              <Card.Body>
                <Card.Title>Sync</Card.Title>
                <SyncConfiguration />
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
}
