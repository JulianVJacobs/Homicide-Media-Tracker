#!/usr/bin/env node

const {
  createDefaultSteps,
  executeBootstrap,
  resolveStateFile,
} = require('./atom-bootstrap-lib.cjs');

const force = process.argv.includes('--force');
const steps = createDefaultSteps(process.env);
const stateFile = resolveStateFile(process.env);

const summary = executeBootstrap({
  steps,
  force,
  stateFile,
});

console.log(
  `AtoM bootstrap complete (executed=${summary.executed}, skipped=${summary.skipped}, toleratedFailures=${summary.toleratedFailures}).`,
);
