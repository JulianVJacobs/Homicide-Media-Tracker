#!/usr/bin/env node

const {
  buildExecutionCommand,
  createDefaultSteps,
  executeBootstrap,
  executeCommand,
  resetBootstrapState,
  resolveStateFile,
} = require('./atom-bootstrap-lib.cjs');

const shouldReseed = process.argv.includes('--reseed');
const forceReseed = process.argv.includes('--force');
const stateFile = resolveStateFile(process.env);
const resetHook = (process.env.ATOM_BOOTSTRAP_RESET_HOOK || '').trim();

if (resetHook) {
  const resetCommand = buildExecutionCommand(resetHook, process.env);
  const output = executeCommand(resetCommand);
  if (output.status !== 0) {
    throw new Error(
      `Reset hook failed with status ${output.status}.\n${output.stdout}\n${output.stderr}`.trim(),
    );
  }
}

resetBootstrapState(stateFile);
console.log(`Cleared bootstrap state at ${stateFile}.`);

if (shouldReseed) {
  const summary = executeBootstrap({
    steps: createDefaultSteps(process.env),
    stateFile,
    force: forceReseed,
  });
  console.log(
    `AtoM bootstrap reseed complete (executed=${summary.executed}, skipped=${summary.skipped}, toleratedFailures=${summary.toleratedFailures}).`,
  );
}
