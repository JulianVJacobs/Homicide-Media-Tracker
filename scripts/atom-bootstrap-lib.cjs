const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const IDEMPOTENT_ERROR_PATTERN =
  /already exists|already enabled|duplicate|has already been taken|not changed/i;

const DEFAULT_STEPS = [
  {
    id: 'admin-setup',
    description: 'Provision initial AtoM administrator account',
    envKey: 'ATOM_BOOTSTRAP_ADMIN_HOOK',
    defaultHook:
      'php symfony tools:install --email="${ATOM_ADMIN_EMAIL:-admin@example.invalid}" --username="${ATOM_ADMIN_USERNAME:-admin}" --password="${ATOM_ADMIN_PASSWORD:-admin}" --siteBaseUrl="${ATOM_SITE_BASE_URL:-http://localhost}" --siteName="${ATOM_SITE_NAME:-AtoM}"',
  },
  {
    id: 'bootstrap-user-state',
    description: 'Apply required bootstrap user/state initialization',
    envKey: 'ATOM_BOOTSTRAP_STATE_HOOK',
    defaultHook:
      'php symfony tools:add-user --username="${ATOM_BOOTSTRAP_USERNAME:-bootstrap}" --password="${ATOM_BOOTSTRAP_PASSWORD:-bootstrap}" --email="${ATOM_BOOTSTRAP_EMAIL:-bootstrap@example.invalid}" --group="${ATOM_BOOTSTRAP_GROUP:-editor}"',
  },
  {
    id: 'plugin-enablement',
    description: 'Enable AtoM plugin required for hosted integration',
    envKey: 'ATOM_BOOTSTRAP_PLUGIN_HOOK',
    defaultHook:
      'php symfony tools:plugins --enable="${ATOM_PLUGIN_NAME:-qaHomicideMediaTrackerPlugin}"',
  },
  {
    id: 'baseline-initialization',
    description: 'Run baseline first-run initialization',
    envKey: 'ATOM_BOOTSTRAP_BASELINE_HOOK',
    defaultHook: 'php symfony search:populate',
  },
];

function parseBoolean(value, fallback) {
  if (value === undefined) return fallback;
  return !['0', 'false', 'no', 'off'].includes(String(value).toLowerCase());
}

function resolveStateFile(env = process.env) {
  return path.resolve(
    env.ATOM_BOOTSTRAP_STATE_FILE || '.atom-host/bootstrap-state.json',
  );
}

function shellQuote(value) {
  return `'${String(value).replace(/'/g, `'\\''`)}'`;
}

function buildExecutionCommand(hook, env = process.env) {
  const trimmedHook = String(hook || '').trim();
  if (!trimmedHook) return '';

  const useCompose = parseBoolean(env.ATOM_BOOTSTRAP_USE_COMPOSE, true);
  if (!useCompose) {
    return trimmedHook;
  }

  const command = ['docker', 'compose'];
  if (env.ATOM_STACK_COMPOSE_FILE) {
    command.push('-f', shellQuote(env.ATOM_STACK_COMPOSE_FILE));
  }
  if (env.ATOM_STACK_PROJECT_NAME) {
    command.push('-p', shellQuote(env.ATOM_STACK_PROJECT_NAME));
  }

  command.push('exec', '-T', shellQuote(env.ATOM_STACK_SERVICE || 'atom'));
  command.push('sh', '-lc', shellQuote(trimmedHook));

  return command.join(' ');
}

function createDefaultSteps(env = process.env) {
  return DEFAULT_STEPS.map((step) => {
    const hook = (env[step.envKey] || step.defaultHook || '').trim();
    return {
      id: step.id,
      description: step.description,
      command: buildExecutionCommand(hook, env),
    };
  });
}

function createStateKey(step) {
  const digest = crypto
    .createHash('sha256')
    .update(step.command || '')
    .digest('hex')
    .slice(0, 16);
  return `${step.id}:${digest}`;
}

function readState(stateFile) {
  if (!fs.existsSync(stateFile)) {
    return { completed: {} };
  }

  try {
    const raw = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
    return raw && typeof raw === 'object' && raw.completed
      ? raw
      : { completed: {} };
  } catch (error) {
    return { completed: {} };
  }
}

function writeState(stateFile, state) {
  fs.mkdirSync(path.dirname(stateFile), { recursive: true });
  fs.writeFileSync(
    stateFile,
    JSON.stringify(
      {
        completed: state.completed,
        updatedAt: new Date().toISOString(),
      },
      null,
      2,
    ),
  );
}

function executeCommand(command) {
  const result = spawnSync(command, {
    shell: true,
    encoding: 'utf8',
  });

  if (result.error) {
    throw result.error;
  }

  return {
    status: result.status ?? 1,
    stdout: result.stdout || '',
    stderr: result.stderr || '',
  };
}

function executeBootstrap({
  steps,
  stateFile = resolveStateFile(),
  force = false,
  runner = executeCommand,
  logger = console,
} = {}) {
  const resolvedSteps = (steps || []).filter((step) => step.command);
  const state = readState(stateFile);
  const summary = {
    executed: 0,
    skipped: 0,
    toleratedFailures: 0,
    stateFile,
  };

  for (const step of resolvedSteps) {
    const stateKey = createStateKey(step);
    if (!force && state.completed[stateKey]) {
      summary.skipped += 1;
      logger.log(`Skipping ${step.id}; already completed.`);
      continue;
    }

    logger.log(`Running ${step.id}: ${step.description}`);
    const output = runner(step.command);

    if (output.status !== 0) {
      const combinedOutput = `${output.stdout}\n${output.stderr}`;
      if (!IDEMPOTENT_ERROR_PATTERN.test(combinedOutput)) {
        throw new Error(
          `Bootstrap step "${step.id}" failed with status ${output.status}.\n${combinedOutput}`.trim(),
        );
      }

      summary.toleratedFailures += 1;
      logger.log(`Treating ${step.id} as successful (idempotent outcome).`);
    }

    state.completed[stateKey] = new Date().toISOString();
    writeState(stateFile, state);
    summary.executed += 1;
  }

  return summary;
}

function resetBootstrapState(stateFile = resolveStateFile()) {
  if (fs.existsSync(stateFile)) {
    fs.rmSync(stateFile);
  }
}

module.exports = {
  IDEMPOTENT_ERROR_PATTERN,
  buildExecutionCommand,
  createDefaultSteps,
  executeBootstrap,
  executeCommand,
  resetBootstrapState,
  resolveStateFile,
};
