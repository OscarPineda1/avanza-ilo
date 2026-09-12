export type FieldObservation = {
  recordId: string;
  set: 'calibration' | 'test';
  routeId: string;
  directionId: string;
  waitPointId: string;
  timeBand: string;
  dataVersion: string;
  method: string;
  predictionRecordedAt: string;
  estimatedArrivalAt: string;
  observedArrivalAt: string;
  extraordinaryEvent: string;
  observerCode: string;
  notes: string;
};

export type MetricSummary = {
  n: number;
  maeMinutes: number;
  rmseMinutes: number;
  biasMinutes: number;
  maxAbsoluteErrorMinutes: number;
  coverageWithinFiveMinutesPercent: number;
};

const REQUIRED_HEADERS = [
  'record_id', 'set', 'route_id', 'direction_id', 'wait_point_id', 'time_band',
  'data_version', 'method', 'prediction_recorded_at', 'estimated_arrival_at',
  'observed_arrival_at', 'extraordinary_event', 'observer_code', 'notes',
] as const;

function parseCsvRows(csv: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  for (let index = 0; index < csv.length; index += 1) {
    const character = csv[index];
    if (character === '"') {
      if (quoted && csv[index + 1] === '"') {
        field += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === ',' && !quoted) {
      row.push(field);
      field = '';
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && csv[index + 1] === '\n') index += 1;
      row.push(field);
      if (row.some((value) => value.length > 0)) rows.push(row);
      row = [];
      field = '';
    } else {
      field += character;
    }
  }
  if (quoted) throw new Error('CSV con comillas sin cerrar.');
  row.push(field);
  if (row.some((value) => value.length > 0)) rows.push(row);
  return rows;
}

export function parseFieldObservations(csv: string): FieldObservation[] {
  const [headers, ...rows] = parseCsvRows(csv);
  if (!headers || REQUIRED_HEADERS.some((header, index) => headers[index] !== header)) {
    throw new Error(`Encabezados requeridos: ${REQUIRED_HEADERS.join(',')}`);
  }
  return rows.map((values, rowIndex) => {
    if (values.length !== REQUIRED_HEADERS.length) throw new Error(`Fila ${rowIndex + 2} incompleta.`);
    const value = Object.fromEntries(REQUIRED_HEADERS.map((header, index) => [header, values[index].trim()]));
    if (!['calibration', 'test'].includes(value.set)) throw new Error(`Fila ${rowIndex + 2}: set inválido.`);
    const required = REQUIRED_HEADERS.filter((header) => !['extraordinary_event', 'notes'].includes(header));
    if (required.some((header) => !value[header])) throw new Error(`Fila ${rowIndex + 2}: falta un campo obligatorio.`);
    const predictionAt = Date.parse(value.prediction_recorded_at);
    const estimatedAt = Date.parse(value.estimated_arrival_at);
    const observedAt = Date.parse(value.observed_arrival_at);
    if (![predictionAt, estimatedAt, observedAt].every(Number.isFinite)) throw new Error(`Fila ${rowIndex + 2}: fecha ISO inválida.`);
    if (predictionAt > observedAt) throw new Error(`Fila ${rowIndex + 2}: la predicción se registró después del arribo observado.`);
    return {
      recordId: value.record_id,
      set: value.set as FieldObservation['set'],
      routeId: value.route_id,
      directionId: value.direction_id,
      waitPointId: value.wait_point_id,
      timeBand: value.time_band,
      dataVersion: value.data_version,
      method: value.method,
      predictionRecordedAt: value.prediction_recorded_at,
      estimatedArrivalAt: value.estimated_arrival_at,
      observedArrivalAt: value.observed_arrival_at,
      extraordinaryEvent: value.extraordinary_event,
      observerCode: value.observer_code,
      notes: value.notes,
    };
  });
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

export function summarizeFieldObservations(observations: FieldObservation[]): MetricSummary {
  if (!observations.length) throw new Error('No hay observaciones para calcular métricas.');
  const errors = observations.map((observation) =>
    (Date.parse(observation.estimatedArrivalAt) - Date.parse(observation.observedArrivalAt)) / 60_000
  );
  const n = errors.length;
  return {
    n,
    maeMinutes: round(errors.reduce((sum, value) => sum + Math.abs(value), 0) / n),
    rmseMinutes: round(Math.sqrt(errors.reduce((sum, value) => sum + value ** 2, 0) / n)),
    biasMinutes: round(errors.reduce((sum, value) => sum + value, 0) / n),
    maxAbsoluteErrorMinutes: round(Math.max(...errors.map(Math.abs))),
    coverageWithinFiveMinutesPercent: round(errors.filter((value) => Math.abs(value) <= 5).length * 100 / n),
  };
}

export function buildFieldEvaluationReport(observations: FieldObservation[]) {
  const testSet = observations.filter((observation) => observation.set === 'test');
  if (!testSet.length) throw new Error('La evaluación requiere observaciones reservadas con set=test.');
  const grouped = new Map<string, FieldObservation[]>();
  testSet.forEach((observation) => {
    const key = `${observation.routeId}|${observation.directionId}|${observation.timeBand}`;
    grouped.set(key, [...(grouped.get(key) ?? []), observation]);
  });
  const ordinary = testSet.filter((observation) => !observation.extraordinaryEvent);
  return {
    dataVersions: [...new Set(testSet.map((observation) => observation.dataVersion))].sort(),
    allTestObservations: summarizeFieldObservations(testSet),
    ordinaryTestObservations: ordinary.length ? summarizeFieldObservations(ordinary) : null,
    byRouteDirectionAndBand: Object.fromEntries(
      [...grouped.entries()].sort(([left], [right]) => left.localeCompare(right)).map(([key, values]) => [key, summarizeFieldObservations(values)])
    ),
  };
}
