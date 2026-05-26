#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const DEFAULT_REFERENCES_FILE = 'data/reference_bibliographique/json/references.json';
const DEFAULT_SCHEMA_FILE = 'data/reference_bibliographique/tools/schema_references.json';
const FORBIDDEN_LOCALIZED_KEYS = new Set(['titre', 'auteurs', 'resume', 'résumé', 'validation_humaine']);

async function main() {
  const options = parseOptions(process.argv.slice(2));
  const diagnostics = [
    createDiagnostic('info', 'REFSCILINK_SCHEMA_VALIDATION_STARTED', 'references.json schema validation started.')
  ];

  const schemaPath = path.resolve(options.schema);
  const referencesPath = path.resolve(options.file);
  const schema = await readJson(schemaPath, 'schema', diagnostics);
  const payload = await readJson(referencesPath, 'references', diagnostics);

  const schemaErrors = validateAgainstSchema(schema, payload, '$');
  const semanticErrors = validateRefSciLinkSemantics(payload);
  const errors = [...schemaErrors, ...semanticErrors];

  if (errors.length) {
    diagnostics.push(createDiagnostic('error', 'REFSCILINK_SCHEMA_VALIDATION_FAILED', 'references.json failed schema validation.', {
      error_count: errors.length
    }));
  } else {
    diagnostics.push(createDiagnostic('success', 'REFSCILINK_SCHEMA_VALIDATION_PASS', 'references.json satisfies schema and RefSciLink structural checks.', {
      path: relativePath(referencesPath)
    }));
  }

  emitDiagnostics(diagnostics);
  emitReport(errors, diagnostics, referencesPath, schemaPath);
  if (errors.length) process.exit(1);
}

function parseOptions(args) {
  const options = {
    file: DEFAULT_REFERENCES_FILE,
    schema: DEFAULT_SCHEMA_FILE
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--file') {
      options.file = readValue(args, ++index, '--file');
    } else if (arg === '--schema') {
      options.schema = readValue(args, ++index, '--schema');
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    } else {
      throw new UsageError(`Unknown option: ${arg}`);
    }
  }

  return options;
}

function readValue(args, index, optionName) {
  const value = args[index];
  if (!value || value.startsWith('--')) throw new UsageError(`Missing value for ${optionName}.`);
  return value;
}

function printHelp() {
  console.log(`Usage:
  node tools/validate_schema.mjs --file data/reference_bibliographique/json/references.json

Options:
  --file <path>      references.json path. Defaults to ${DEFAULT_REFERENCES_FILE}
  --schema <path>    JSON schema path. Defaults to ${DEFAULT_SCHEMA_FILE}
`);
}

async function readJson(filePath, label, diagnostics) {
  const raw = await fs.readFile(filePath, 'utf8');
  const payload = JSON.parse(raw);
  diagnostics.push(createDiagnostic('success', label === 'schema' ? 'REFSCILINK_SCHEMA_READ' : 'REFSCILINK_JSON_READ', `${label} JSON was read.`, {
    path: relativePath(filePath)
  }));
  return payload;
}

function validateAgainstSchema(schema, value, valuePath) {
  const errors = [];
  validateNode(schema, value, valuePath, errors);
  return errors;
}

function validateNode(schema, value, valuePath, errors) {
  if (!schema || typeof schema !== 'object') return;

  if (schema.type && !matchesType(value, schema.type)) {
    errors.push(createError(valuePath, 'REFSCILINK_SCHEMA_TYPE_MISMATCH', `Expected ${schema.type}.`));
    return;
  }

  if (schema.enum && !schema.enum.includes(value)) {
    errors.push(createError(valuePath, 'REFSCILINK_SCHEMA_ENUM_INVALID', `Value must be one of: ${schema.enum.join(', ')}.`));
  }

  if (schema.type === 'object' && value && typeof value === 'object' && !Array.isArray(value)) {
    validateObject(schema, value, valuePath, errors);
  }

  if (schema.type === 'array' && Array.isArray(value)) {
    value.forEach((item, index) => validateNode(schema.items, item, `${valuePath}[${index}]`, errors));
  }
}

function validateObject(schema, value, valuePath, errors) {
  const properties = schema.properties || {};
  for (const requiredKey of schema.required || []) {
    if (!Object.hasOwn(value, requiredKey)) {
      errors.push(createError(`${valuePath}.${requiredKey}`, 'REFSCILINK_SCHEMA_REQUIRED_MISSING', 'Required property is missing.'));
    }
  }

  for (const [key, childValue] of Object.entries(value)) {
    if (properties[key]) {
      validateNode(properties[key], childValue, `${valuePath}.${key}`, errors);
    } else if (schema.additionalProperties === false) {
      errors.push(createError(`${valuePath}.${key}`, 'REFSCILINK_SCHEMA_ADDITIONAL_PROPERTY', 'Additional property is not allowed by the schema.'));
    }
  }
}

function matchesType(value, expectedType) {
  if (expectedType === 'array') return Array.isArray(value);
  if (expectedType === 'object') return value !== null && typeof value === 'object' && !Array.isArray(value);
  if (expectedType === 'number') return typeof value === 'number' && Number.isFinite(value);
  return typeof value === expectedType;
}

function validateRefSciLinkSemantics(payload) {
  const errors = [];
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return [createError('$', 'REFSCILINK_SCHEMA_ROOT_INVALID', 'references.json root must be an object.')];
  }

  const references = payload.references;
  if (!Array.isArray(references)) return errors;

  if (payload.metadata?.reference_count !== references.length) {
    errors.push(createError('$.metadata.reference_count', 'REFSCILINK_SCHEMA_REFERENCE_COUNT_MISMATCH', 'metadata.reference_count must match references.length.'));
  }

  const ids = new Set();
  const numbers = new Set();
  references.forEach((reference, index) => validateReferenceSemantics(reference, index, ids, numbers, errors));
  return errors;
}

function validateReferenceSemantics(reference, index, ids, numbers, errors) {
  const basePath = `$.references[${index}]`;
  if (!reference || typeof reference !== 'object' || Array.isArray(reference)) return;

  // These checks protect project-specific invariants beyond generic JSON
  // Schema: stable identifiers, UI filtering consistency and English keys.
  if (!/^ref\d{3,}$/.test(reference.id || '')) {
    errors.push(createError(`${basePath}.id`, 'REFSCILINK_SCHEMA_ID_INVALID', 'Reference id must match refNNN.'));
  }
  if (ids.has(reference.id)) {
    errors.push(createError(`${basePath}.id`, 'REFSCILINK_SCHEMA_ID_DUPLICATE', 'Reference id must be unique.'));
  }
  ids.add(reference.id);

  if (!Number.isInteger(reference.number) || reference.number <= 0) {
    errors.push(createError(`${basePath}.number`, 'REFSCILINK_SCHEMA_NUMBER_INVALID', 'Reference number must be a positive integer.'));
  }
  if (numbers.has(reference.number)) {
    errors.push(createError(`${basePath}.number`, 'REFSCILINK_SCHEMA_NUMBER_DUPLICATE', 'Reference number must be unique.'));
  }
  numbers.add(reference.number);

  if (reference.validated !== (reference.validation_status === 'validated')) {
    errors.push(createError(`${basePath}.validated`, 'REFSCILINK_SCHEMA_VALIDATION_INCONSISTENT', 'validated must mirror validation_status === validated.'));
  }

  for (const key of Object.keys(reference)) {
    if (FORBIDDEN_LOCALIZED_KEYS.has(key)) {
      errors.push(createError(`${basePath}.${key}`, 'REFSCILINK_SCHEMA_LOCALIZED_KEY_FORBIDDEN', 'Internal reference keys must remain English.'));
    }
  }
}

function createError(pathValue, code, message) {
  return { path: pathValue, code, message };
}

function createDiagnostic(severity, code, message, details = {}) {
  return { severity, code, message, details };
}

function emitDiagnostics(diagnostics) {
  diagnostics.forEach(diagnostic => {
    console.log(`[${diagnostic.severity}] ${diagnostic.code}: ${diagnostic.message}`);
  });
}

function emitReport(errors, diagnostics, referencesPath, schemaPath) {
  const report = {
    status: errors.length ? 'fail' : 'pass',
    summary: {
      pass: errors.length ? 0 : 1,
      fail: errors.length ? errors.length : 0,
      warning: 0,
      manual_review_required: 0
    },
    files: {
      references: relativePath(referencesPath),
      schema: relativePath(schemaPath)
    },
    diagnostics,
    errors
  };
  console.log(JSON.stringify(report, null, 2));
}

function relativePath(filePath) {
  const relative = path.relative(process.cwd(), filePath);
  return relative.startsWith('..') ? path.basename(filePath) : relative;
}

class UsageError extends Error {}

main().catch(error => {
  const code = error instanceof UsageError ? 'REFSCILINK_SCHEMA_USAGE_ERROR' : 'REFSCILINK_RUN_FAILED';
  console.error(`[error] ${code}: ${error.message}`);
  process.exit(1);
});
