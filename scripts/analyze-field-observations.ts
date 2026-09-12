import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildFieldEvaluationReport, parseFieldObservations } from '../src/services/field-evaluation';

const input = process.argv[2];
if (!input) throw new Error('Uso: npm run analyze:field -- <archivo.csv>');
const observations = parseFieldObservations(readFileSync(resolve(input), 'utf8'));
console.log(JSON.stringify(buildFieldEvaluationReport(observations), null, 2));
