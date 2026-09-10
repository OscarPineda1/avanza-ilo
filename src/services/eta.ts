import { computeEta, minuteOfDay, type EtaResult } from './eta-core';
import type { RoutePosition } from './route-position';

export type { EtaResult } from './eta-core';
export {
  computeEta,
  formatMinuteOfDay,
  inferArrivalFromService,
  minuteOfDay,
  parseFrequencyMinutes,
  travelMinutesToPosition,
} from './eta-core';

export async function getEta(
  routeName: string,
  waitPoint: RoutePosition | string,
  sequenceId?: string,
  queryDate = new Date()
): Promise<EtaResult> {
  return computeEta(routeName, waitPoint, minuteOfDay(queryDate), sequenceId);
}
