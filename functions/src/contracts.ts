export const OPERATION_TIME_ZONE = 'America/Lima' as const;

export type Coordinate = {
  latitude: number;
  longitude: number;
};

export type PublishedReference = {
  id: string;
  routeName: string;
  sequenceId: string;
  name: string;
  coordinate: Coordinate;
  coordinateIndex: number;
  order: number;
  isOrigin?: boolean;
  isDestination?: boolean;
};

export type PublishedSequence = {
  id: string;
  label: string;
  kind: 'direction' | 'circuit';
  coordinates: Coordinate[];
  stops: PublishedReference[];
};

export type PublishedServiceProfile = {
  startMinute: number;
  endMinute: number;
  headwayMinutes: number;
  dispatchReferenceMinute: number | null;
  dispatchReferenceKind: 'none' | 'scheduled' | 'estimated';
  timezone: typeof OPERATION_TIME_ZONE;
  source: string;
  sourceDate: string;
};

export type PublishedTravelProfile = {
  id: string;
  band: string;
  averageSpeedKmh: number;
  stopPenaltyMinutes: number;
  source: string;
  sourceDate: string;
  evidence: 'field' | 'synthetic' | 'assumption';
  weightUnit: 'seconds';
};

export type PublishedRoute = {
  id: string;
  nombre: string;
  descripcion: string;
  origen: string;
  destino: string;
  color: string;
  empresa: string;
  zona: string;
  horario: string;
  tarifa: string;
  frecuencia: string;
  available: boolean;
  pilot: boolean;
  sentido: string;
  defaultSequenceId: string;
  sequences: PublishedSequence[];
  service: PublishedServiceProfile;
  travelProfile: PublishedTravelProfile;
};

export type PublishedSnapshot = {
  schemaVersion: 1;
  status: 'published';
  dataVersion: string;
  source: string;
  sourceDate: string;
  geometrySourceDate: string;
  decision: string;
  publishedAt: string;
  publishedBy: string;
  routes: PublishedRoute[];
};

export type EtaRequest = {
  routeId: string;
  directionId: string;
  referenceId?: string;
  waitPosition?: {
    segmentIndex: number;
    fraction: number;
  };
  expectedDataVersion?: string;
};

export type EtaStatus =
  | 'available'
  | 'average_wait'
  | 'out_of_service'
  | 'no_route'
  | 'insufficient_data'
  | 'invalid_input'
  | 'version_mismatch'
  | 'backend_error';

export type EtaResponse = {
  status: EtaStatus;
  etaMinutes: number | null;
  estimatedArrivalAt: string | null;
  method: string;
  dataVersion: string | null;
  assumptions: {
    timezone: typeof OPERATION_TIME_ZONE;
    waitPoint?: string;
    travelProfileId?: string;
    weightUnit?: 'seconds';
    weightSource?: string;
    weightEvidence?: 'field' | 'synthetic' | 'assumption';
    dispatchReferenceKind?: 'none' | 'scheduled' | 'estimated';
    vehicleTracking: false;
    realTimeTraffic: false;
    occupancy: false;
    note: string;
  };
};

export type ValidationIssue = {
  code: string;
  message: string;
  routeId?: string;
  directionId?: string;
};

export type SnapshotValidation = {
  valid: boolean;
  issues: ValidationIssue[];
  summary: {
    routes: number;
    directions: number;
    coordinates: number;
    references: number;
    edges: number;
  };
};
