/**
 * Sync Configuration Component for Homicide Media Tracker
 *
 * This component allows users to configure remote LibSQL database
 * synchronization for when network connectivity is available.
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Card, Button, Form, Spinner, Modal, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';

interface SyncConfig {
  enabled: boolean;
  remoteUrl: string | null;
  conflictResolution: 'local' | 'remote' | 'manual';
  syncInterval: number;
  lastSync: string | null;
}

const SyncConfiguration: React.FC = () => {
  const [config, setConfig] = useState<SyncConfig | null>(null);
  // const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showLocalInfo, setShowLocalInfo] = useState(false);
  const [connType, setConnType] = useState<'none' | 'local' | 'remote'>('none');
  const [localUrl, setLocalUrl] = useState('');
  const [localStatus, setLocalStatus] = useState<'unknown' | 'ok' | 'down'>(
    'unknown',
  );
  const [remoteStatus, setRemoteStatus] = useState<'unknown' | 'ok' | 'down'>(
    'unknown',
  );

  // Form state
  const [remoteUrl, setRemoteUrl] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [syncInterval, setSyncInterval] = useState(15);
  const [conflictResolution, setConflictResolution] = useState<
    'local' | 'remote' | 'manual'
  >('local');
  const [advancedSettings, setAdvancedSettings] = useState(false);

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/sync');
      if (!response.ok) {
        throw new Error('Failed to fetch sync configuration');
      }
      const data = await response.json();

      if (data.success) {
        setConfig(data.data);
        // Update form state
        // safer extraction for optional fields
        const dd = data.data as unknown as Record<string, unknown>;
        setRemoteUrl(String(dd?.remoteUrl ?? ''));
        setLocalUrl(String(dd?.localUrl ?? ''));
        const ct = dd?.connectionType;
        if (ct === 'local' || ct === 'remote' || ct === 'none') {
          setConnType(ct as 'local' | 'remote' | 'none');
        } else {
          setConnType(dd?.remoteUrl ? 'remote' : 'none');
        }
        setSyncInterval(Number(dd?.syncInterval ?? syncInterval));
        const savedConflict = String(dd?.conflictResolution ?? 'local') as
          | 'local'
          | 'remote'
          | 'manual';
        // If the saved policy is anything other than 'local', surface
        // advanced settings so the user can see/change it. Otherwise keep
        // the simpler default (client-first) and hide the advanced control.
        if (savedConflict && savedConflict !== 'local') {
          setAdvancedSettings(true);
          setConflictResolution(savedConflict);
        } else {
          setAdvancedSettings(false);
          setConflictResolution('local');
        }
      }
    } catch (error) {
      console.error('Failed to fetch sync config:', error);
      toast.error('Failed to load sync configuration');
    } finally {
      // setLoading(false);
    }
  };

  useEffect(() => {
    // Load saved configuration on mount so UI reflects persisted settings
    fetchConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // No auto-switching of conflict policy; default is client-first ('local').

  // probe a url (health endpoint) with timeout
  const probeUrl = useCallback(
    async (url: string, timeout = 1500): Promise<'ok' | 'down'> => {
      if (!url) return 'down';
      try {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        const headers: Record<string, string> = {};
        if (authToken) {
          headers['Authorization'] = `Bearer ${authToken}`;
        }
        const res = await fetch(url, {
          method: 'GET',
          signal: controller.signal,
          headers,
        });
        clearTimeout(id);
        return res.ok ? 'ok' : 'down';
      } catch (err) {
        return 'down';
      }
    },
    [authToken],
  );

  const refreshStatuses = useCallback(async () => {
    // remote
    if (remoteUrl) {
      setRemoteStatus('unknown');
      const r = await probeUrl(remoteUrl.replace(/\/$/, '') + '/health');
      setRemoteStatus(r);
    } else {
      setRemoteStatus('unknown');
    }

    if (localUrl) {
      setLocalStatus('unknown');
      const r = await probeUrl(localUrl.replace(/\/$/, '') + '/health');
      setLocalStatus(r);
    } else {
      setLocalStatus('unknown');
    }
  }, [localUrl, remoteUrl, probeUrl]);

  return (
    <>
      <Card>
        <Card.Header>
          <h5 className="mb-0">
            <i className="bi bi-cloud-arrow-up me-2"></i>
            Remote Sync Configuration
          </h5>
        </Card.Header>
        <Card.Body>
          {/* Show the main controls always: connection type and visible fields */}
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Connection Type</Form.Label>
              <div>
                <Form.Check
                  inline
                  type="radio"
                  id="conn-none"
                  label="None"
                  name="connType"
                  checked={connType === 'none'}
                  onChange={() => setConnType('none')}
                />
                <Form.Check
                  inline
                  type="radio"
                  id="conn-local"
                  label={
                    <>
                      Local
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0 ms-2"
                        onClick={() => setShowLocalInfo(true)}
                      >
                        <i className="bi bi-info-circle"></i>
                      </Button>
                      {localStatus === 'ok' && (
                        <Badge bg="success" className="ms-2">
                          Online
                        </Badge>
                      )}
                      {localStatus === 'down' && (
                        <Badge bg="danger" className="ms-2">
                          Offline
                        </Badge>
                      )}
                    </>
                  }
                  name="connType"
                  checked={connType === 'local'}
                  onChange={() => setConnType('local')}
                />
                <Form.Check
                  inline
                  type="radio"
                  id="conn-remote"
                  label={
                    <>
                      Remote
                      {remoteStatus === 'ok' && (
                        <Badge bg="success" className="ms-2">
                          Online
                        </Badge>
                      )}
                      {remoteStatus === 'down' && (
                        <Badge bg="danger" className="ms-2">
                          Offline
                        </Badge>
                      )}
                    </>
                  }
                  name="connType"
                  checked={connType === 'remote'}
                  onChange={() => setConnType('remote')}
                />
                <Button
                  variant="outline-secondary"
                  size="sm"
                  className="ms-3"
                  onClick={() => refreshStatuses()}
                >
                  <i className="bi bi-arrow-clockwise me-1"></i> Check status
                </Button>
              </div>
            </Form.Group>

            {/* Local settings shown only when Local is selected */}
            {connType === 'local' && (
              <Form.Group className="my-3">
                <Form.Label>Local server URL</Form.Label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Form.Control
                    type="url"
                    value={localUrl}
                    onChange={(e) => setLocalUrl(e.target.value)}
                    placeholder="http://127.0.0.1:8080"
                  />
                  <Button
                    variant="outline-primary"
                    onClick={() => {
                      refreshStatuses();
                      toast.info('Probing local server...');
                    }}
                  >
                    Check
                  </Button>
                </div>
                <Form.Text className="text-muted">
                  If you run a local LibSQL/SQLite HTTP shim, enter its base
                  URL.
                </Form.Text>
              </Form.Group>
            )}

            {connType === 'remote' && (
              <>
                <Form.Group className="my-3">
                  <Form.Label>Remote LibSQL URL</Form.Label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Form.Control
                      type="url"
                      value={remoteUrl}
                      onChange={(e) => setRemoteUrl(e.target.value)}
                      placeholder="libsql://your-database-url.turso.io"
                    />
                    <Button
                      variant="outline-primary"
                      onClick={() => {
                        refreshStatuses();
                        toast.info('Probing remote server...');
                      }}
                    >
                      Check
                    </Button>
                  </div>
                  <Form.Text className="text-muted">
                    A remote LibSQL/Turso endpoint is optional — local server is
                    preferred for offline-first usage.
                  </Form.Text>
                </Form.Group>
              </>
            )}

            {connType !== 'none' && (
              <>
                <Form.Group className="my-3">
                  <Form.Label>Auth Token</Form.Label>
                  <Form.Control
                    type="password"
                    value={authToken}
                    onChange={(e) => setAuthToken(e.target.value)}
                    placeholder="Optional authentication token"
                  />
                  <Form.Text className="text-muted">
                    Optional token used for authenticated local or remote
                    servers. If your server requires authentication enter a
                    token here.
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Sync Interval (minutes)</Form.Label>
                  <Form.Control
                    type="number"
                    value={syncInterval}
                    onChange={(e) => setSyncInterval(parseInt(e.target.value))}
                    min="1"
                    max="1440"
                  />
                  <Form.Text className="text-muted">
                    How often the app should attempt to synchronize with the
                    configured server. Shorter intervals increase network
                    activity; PWAs may not reliably sync in the background.
                  </Form.Text>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Conflict Resolution</Form.Label>

                  <div className="mb-2">
                    <Form.Check
                      type="switch"
                      id="advanced-settings"
                      label="Show advanced sync settings"
                      checked={advancedSettings}
                      onChange={(e) => {
                        const enabled = e.target.checked;
                        setAdvancedSettings(enabled);
                        if (!enabled) setConflictResolution('local');
                      }}
                    />
                  </div>

                  {!advancedSettings ? (
                    <Form.Text>
                      <strong>
                        Honour changes made directly in the application first
                      </strong>{' '}
                      — the app will prefer data edited inside the application
                      (IndexedDB) when resolving conflicts.
                    </Form.Text>
                  ) : (
                    <>
                      <Form.Select
                        value={conflictResolution}
                        onChange={(e) =>
                          setConflictResolution(
                            e.target.value as 'local' | 'remote' | 'manual',
                          )
                        }
                      >
                        <option value="local">
                          Honour changes made directly in the application first
                        </option>
                        <option value="remote">
                          Honour changes made directly to the database first
                        </option>
                      </Form.Select>
                      <Form.Text className="text-muted">
                        {connType === 'local' ? (
                          <>
                            <strong>Application</strong>: the IndexedDB copy in
                            this browser/PWA. <strong>Database</strong>: the DB
                            hosted by your local server.
                          </>
                        ) : (
                          <>
                            <strong>Application</strong>: the IndexedDB copy in
                            this browser/PWA. <strong>Database</strong>: your
                            configured remote server.
                          </>
                        )}
                      </Form.Text>
                    </>
                  )}
                </Form.Group>
              </>
            )}
            <div className="d-flex justify-content-end gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  // reset form to loaded config
                  const cfg = config as unknown as Record<string, unknown>;
                  setRemoteUrl(String(cfg?.remoteUrl ?? ''));
                  setLocalUrl(String(cfg?.localUrl ?? ''));
                  const ctype = cfg?.connectionType;
                  if (
                    ctype === 'local' ||
                    ctype === 'remote' ||
                    ctype === 'none'
                  ) {
                    setConnType(ctype as 'local' | 'remote' | 'none');
                  } else {
                    setConnType(cfg?.enabled ? 'remote' : 'none');
                  }
                }}
              >
                Reset
              </Button>
              <Button
                variant="primary"
                onClick={async () => {
                  // save the configuration
                  setSaving(true);
                  try {
                    const response = await fetch('/api/sync', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        connectionType: connType,
                        remoteUrl,
                        authToken: authToken || undefined,
                        syncInterval,
                        conflictResolution,
                        localUrl: localUrl || undefined,
                      }),
                    });
                    const data = await response.json();
                    if (data.success) {
                      toast.success('Sync configuration saved');
                      await fetchConfig();
                    } else {
                      toast.error(data.error || 'Failed to save');
                    }
                  } catch (err) {
                    console.error('Save sync config:', err);
                    toast.error('Failed to save sync configuration');
                  } finally {
                    setSaving(false);
                  }
                }}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-1" />
                    Saving...
                  </>
                ) : (
                  'Save Configuration'
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
      <Modal
        show={showLocalInfo}
        onHide={() => setShowLocalInfo(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Local server setup instructions</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            You can run a small local LibSQL/SQLite HTTP shim to provide a
            reliable local database for the PWA. Below are platform-specific
            instructions and quick-start commands.
          </p>
          <h6>Windows</h6>
          <pre>
            {`1. Download the provided binary for Windows.
2. Unzip to a folder, e.g. C:\\Program Files\\hmt-local-db
3. Run: hmt-local-db.exe --port 8080
4. Make sure the program is allowed through the firewall.`}
          </pre>

          <h6>macOS</h6>
          <pre>
            {`1. Download the macOS signed binary (.dmg or .tar.gz).
2. Install and run: ./hmt-local-db --port 8080
3. Optionally move to /usr/local/bin for convenience.`}
          </pre>

          <h6>Linux</h6>
          <pre>
            {`1. Download the Linux binary.
2. chmod +x hmt-local-db && ./hmt-local-db --port 8080
3. Consider installing as a systemd service for auto-start.`}
          </pre>

          <p>
            When the local server is running, set the{' '}
            <code>Local server URL</code>
            above to <code>http://127.0.0.1:8080</code> (or the port you chose)
            and click <strong>Check</strong>.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowLocalInfo(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default SyncConfiguration;
