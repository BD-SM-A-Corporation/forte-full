import { JobResponse, RuleCatalogue, AnalyzeInitiateResponse, ReviewAssessment, ObservationResponse } from './types';

interface WireJob {
  job_id: string;
  status: 'processing' | 'done' | 'failed';
  verdict?: 'violation' | 'no_violation';
  assessment?: ReviewAssessment;
  error?: string;
  violations?: { type: string; timecode_sec: number; description: string; confidence?: number | null; uncertainties?: string[]; evidence_frames: { timestamp_sec: number; image_base64: string }[] }[];
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/backend/${path}`, { ...init, cache: 'no-store', signal: AbortSignal.timeout(65_000) });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(typeof data?.detail === 'string' ? data.detail : `Ошибка API: ${response.status}`);
  if (!data) throw new Error('API вернул пустой ответ');
  return data;
}

export async function uploadVideo(file: File): Promise<AnalyzeInitiateResponse> {
  const body = new FormData();
  body.append('file', file);
  const result = await request<{ job_id: string }>('analyze', { method: 'POST', body });
  return { ...result, status: 'processing', message: 'Видео принято в обработку' };
}

export async function getJobStatus(jobId: string): Promise<JobResponse> {
  const raw = await request<WireJob>(`jobs/${encodeURIComponent(jobId)}`);
  type Observation = Omit<ObservationResponse, 'matched_rules'>;
  type Match = { observation: Observation; rule: { name: string; source: { document: string; section: string; url: string } } };
  let matches: Match[] = [];
  let observations: ObservationResponse[] = [];
  let observationsStatus: JobResponse['observations_status'] = 'unavailable';
  let videoDuration: number | null = null;
  let ruleChecks: JobResponse['rule_checks'] = [];
  let verificationSummary: JobResponse['verification_summary'] = null;
  if (raw.status === 'done') {
    try {
      const audit = await request<{ details: { matches?: Match[]; observations?: Observation[]; metrics?: { video_duration_sec?: number }; rule_checks?: JobResponse['rule_checks']; verification_summary?: JobResponse['verification_summary'] } | null }>(`jobs/${encodeURIComponent(jobId)}/details`);
      matches = audit.details?.matches || [];
      ruleChecks = audit.details?.rule_checks ?? [];
      verificationSummary = audit.details?.verification_summary ?? null;
      if (Array.isArray(audit.details?.observations)) {
        observationsStatus = 'available';
        observations = audit.details.observations.map(observation => ({
          ...observation,
          confidence: observation.confidence ?? null,
          uncertainties: observation.uncertainties ?? [],
          evidence_timestamps: observation.evidence_timestamps ?? [],
          facts: observation.facts ?? {},
          matched_rules: matches.filter(match =>
            match.observation.event_type === observation.event_type &&
            match.observation.start_sec === observation.start_sec &&
            match.observation.end_sec === observation.end_sec &&
            match.observation.description === observation.description
          ).map(match => match.rule.name),
        }));
      }
      const reportedDuration = audit.details?.metrics?.video_duration_sec;
      if (typeof reportedDuration === 'number' && Number.isFinite(reportedDuration) && reportedDuration > 0) {
        videoDuration = reportedDuration;
      }
    } catch { /* The preliminary result remains usable without optional audit metadata. */ }
  }
  const violations = (raw.violations || []).map((v, index) => {
    const match = matches.find(m => m.rule.name === v.type && m.observation.start_sec === v.timecode_sec);
    return ({
    id: index + 1, event_type: v.type, title: v.type, description: v.description,
    timestamp_sec: v.timecode_sec, confidence: v.confidence ?? match?.observation.confidence ?? null,
    confidence_kind: 'self_reported_observation' as const,
    uncertainties: v.uncertainties ?? [],
    end_timestamp_sec: match?.observation.end_sec,
    rule_source: match?.rule.source.document, rule_section: match?.rule.source.section, rule_url: match?.rule.source.url,
    frame_b64: v.evidence_frames[0]?.image_base64,
    evidence_frames: v.evidence_frames,
  }); });
  return {
    job_id: raw.job_id, status: raw.status === 'done' ? 'completed' : raw.status,
    verdict: raw.verdict || 'pending', progress: raw.status === 'done' ? 100 : 15,
    assessment: raw.status === 'done' ? (raw.assessment ?? {
      status: raw.violations?.length ? 'potential_violation' : 'no_supported_match',
      review_required: true, decision_status: 'pending_human_review',
    }) : null,
    filename: 'Видеозапись', created_at: '', error: raw.error,
    violations_count: violations.length, violations,
    observations, observations_status: observationsStatus, video_duration_sec: videoDuration,
    rule_checks: ruleChecks, verification_summary: verificationSummary,
  };
}

export async function getRules(): Promise<RuleCatalogue> {
  return request<RuleCatalogue>('rules');
}

export function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 10);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function juryResult(job: JobResponse) {
  return {
    job_id: job.job_id, status: job.status === 'completed' ? 'done' : job.status,
    verdict: job.verdict,
    assessment: job.assessment,
    violations: job.violations.map(v => ({ type: v.title, timecode_sec: v.timestamp_sec, description: v.description, confidence: v.confidence, confidence_kind: v.confidence_kind, uncertainties: v.uncertainties, evidence_frames: v.evidence_frames || [] })),
  };
}
