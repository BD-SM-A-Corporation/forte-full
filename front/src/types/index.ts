// Shared types for the ForteBank AI Inspector

export type ProcessingStatus = "idle" | "uploading" | "processing" | "done" | "failed";

export interface EvidenceFrame {
  timestamp_sec: number;
  image_base64: string; // JPEG base64
}

export interface Violation {
  type: string;
  timecode_sec: number;
  description: string;
  rationale?: string;
  evidence_frames: EvidenceFrame[];
  // A source must be provided and checked; the UI never invents a legal reference.
  regulation?: string;
  regulation_article?: string;
  regulation_url?: string;
}

export interface AnalysisResult {
  job_id: string;
  status: "processing" | "done" | "failed";
  verdict: "no_violation" | "violation";
  violations: Violation[];
  processing_time_ms?: number;
}

export interface ChecklistItem {
  id: string;
  label: string;
  ok: boolean;
  timecode_sec?: number;
}
