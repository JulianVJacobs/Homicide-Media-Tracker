const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  executeBootstrap,
  resetBootstrapState,
} = require('../scripts/atom-bootstrap-lib.cjs');

const silentLogger = {
  log: () => {},
};

describe('atom bootstrap orchestration', () => {
  it('executes all steps once and skips them on rerun using persisted state', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'atom-bootstrap-'));
    const stateFile = path.join(tmpDir, 'bootstrap-state.json');
    const executedCommands = [];

    const runner = (command) => {
      executedCommands.push(command);
      return { status: 0, stdout: '', stderr: '' };
    };

    const steps = [
      { id: 'admin', description: 'admin setup', command: 'echo admin' },
      { id: 'plugin', description: 'plugin enablement', command: 'echo plugin' },
    ];

    const firstRun = executeBootstrap({ steps, stateFile, runner, logger: silentLogger });
    const secondRun = executeBootstrap({ steps, stateFile, runner, logger: silentLogger });

    expect(firstRun.executed).toBe(2);
    expect(firstRun.skipped).toBe(0);
    expect(secondRun.executed).toBe(0);
    expect(secondRun.skipped).toBe(2);
    expect(executedCommands).toEqual(['echo admin', 'echo plugin']);
  });

  it('tolerates known idempotent errors and records the step as complete', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'atom-bootstrap-'));
    const stateFile = path.join(tmpDir, 'bootstrap-state.json');

    const firstRun = executeBootstrap({
      steps: [{ id: 'admin', description: 'admin setup', command: 'echo admin' }],
      stateFile,
      logger: silentLogger,
      runner: () => ({
        status: 1,
        stdout: '',
        stderr: 'admin user already exists',
      }),
    });

    const secondRun = executeBootstrap({
      steps: [{ id: 'admin', description: 'admin setup', command: 'echo admin' }],
      stateFile,
      logger: silentLogger,
      runner: () => ({
        status: 0,
        stdout: '',
        stderr: '',
      }),
    });

    expect(firstRun.executed).toBe(1);
    expect(firstRun.toleratedFailures).toBe(1);
    expect(secondRun.skipped).toBe(1);
  });

  it('allows reset plus reseed by clearing persisted state', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'atom-bootstrap-'));
    const stateFile = path.join(tmpDir, 'bootstrap-state.json');
    const executedCommands = [];

    const runner = (command) => {
      executedCommands.push(command);
      return { status: 0, stdout: '', stderr: '' };
    };

    const steps = [{ id: 'baseline', description: 'baseline', command: 'echo baseline' }];

    executeBootstrap({ steps, stateFile, runner, logger: silentLogger });
    resetBootstrapState(stateFile);
    executeBootstrap({ steps, stateFile, runner, logger: silentLogger });

    expect(executedCommands).toEqual(['echo baseline', 'echo baseline']);
  });
});
