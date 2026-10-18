import type { ObservationResponse, ViolationResponse } from './types';

export interface TimelineEvent {
  id: string;
  start: number;
  end: number;
  title: string;
  description: string;
  confidence: number | null;
  uncertainties: string[];
  evidence: number[];
  rules: string[];
  violationId?: number;
  originalObservation: boolean;
}

const actionNames: Record<string, string> = {
  object_transfer: 'Передача предмета', object_placement: 'Размещение предмета',
  cash_like_object_handling: 'Действия с похожими на деньги предметами',
  cash_receipt: 'Приём наличных', cash_counting: 'Пересчёт наличных',
  cash_storage: 'Размещение наличных', cash_handover: 'Передача наличных',
  cash_pocketing: 'Помещение наличных в карман',
  operator_leaving_workstation: 'Уход от рабочего места',
  person_entering: 'Появление человека', person_leaving: 'Уход человека',
  phone_interaction: 'Использование телефона', document_handover: 'Передача документа',
  counterparty_leaving: 'Уход участника', counterparty_cash_counting: 'Пересчёт участником',
};

export function buildTimelineEvents(observations: ObservationResponse[], violations: ViolationResponse[]): TimelineEvent[] {
  const events: TimelineEvent[] = observations.map((observation, index) => ({
    id: `observation-${index}`, start: observation.start_sec, end: observation.end_sec,
    title: actionNames[observation.event_type] ?? observation.event_type,
    description: observation.description, confidence: observation.confidence,
    uncertainties: observation.uncertainties, evidence: observation.evidence_timestamps,
    rules: observation.matched_rules, originalObservation: true,
  }));
  for (const [index, violation] of violations.entries()) {
    const observation = events.find(event => event.start === violation.timestamp_sec && event.rules.includes(violation.title));
    if (observation) {
      observation.violationId = violation.id;
      continue;
    }
    // Old jobs or a failed /details request can still expose the saved result.
    events.push({
      id: `match-${index}`, start: violation.timestamp_sec,
      end: violation.end_timestamp_sec ?? violation.timestamp_sec,
      title: violation.title, description: violation.description,
      confidence: violation.confidence, uncertainties: violation.uncertainties,
      evidence: violation.evidence_frames?.map(frame => frame.timestamp_sec) ?? [],
      rules: [violation.title], violationId: violation.id, originalObservation: false,
    });
  }
  return events.sort((a, b) => a.start - b.start || a.end - b.end);
}

export function groupTimelineEvents(events: TimelineEvent[], duration: number): TimelineEvent[][] {
  const groups: TimelineEvent[][] = [];
  for (const event of events) {
    const previous = groups.at(-1);
    if (previous && event.start - previous[0].start < duration / 10) previous.push(event);
    else groups.push([event]);
  }
  return groups;
}

export function eventsAtTime(events: TimelineEvent[], time: number): TimelineEvent[] {
  return events.filter(event => event.start === event.end
    ? Math.abs(event.start - time) <= 0.2
    : event.start <= time && time <= event.end);
}
