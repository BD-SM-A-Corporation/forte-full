"use client";

import type { Violation } from "@/types";
import { CheckCircleIcon, InformationCircleIcon, ClockIcon } from "@heroicons/react/24/outline";

interface ComplianceChecklistProps {
  violations: Violation[];
  onSeek?: (t: number) => void;
  lang?: "ru" | "kz" | "en";
}

function formatTime(seconds: number) {
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
}

export default function ComplianceChecklist({ violations, onSeek, lang = "ru" }: ComplianceChecklistProps) {
  const t = {
    ru: {
      note: "Проверяется только заполненность отчёта. Наличие полей не подтверждает достоверность наблюдения или соблюдение кассовых правил.",
      empty: "События не отмечены. Полнота карточек событий не оценивается; это не заключение о соблюдении всех требований.",
      events: "Карточек событий", filled: "Полей заполнено", missing: "Полей отсутствует",
      type: "Тип видимого события", time: "Таймкод события", observation: "Описание видимого наблюдения", rationale: "Обоснование для просмотра",
      frames: "От 1 до 3 кадров с таймкодами", source: "Предоставленный нормативный источник",
      present: "Есть в карточках", needsData: "Нужно дополнить", seek: "Открыть событие в видео",
    },
    kz: {
      note: "Тек есептің толтырылуы тексеріледі. Өрістердің болуы бақылаудың дұрыстығын немесе кассалық ережелердің сақталуын растамайды.",
      empty: "Оқиғалар белгіленбеген. Оқиға карточкаларының толықтығы бағаланбайды; бұл барлық талаптардың сақталуы туралы қорытынды емес.",
      events: "Оқиға карточкалары", filled: "Толтырылған өрістер", missing: "Жетіспейтін өрістер",
      type: "Көрінетін оқиға түрі", time: "Оқиға таймкоды", observation: "Көрінетін бақылау сипаттамасы", rationale: "Қарауға арналған негіздеме",
      frames: "Таймкодтары бар 1–3 кадр", source: "Берілген нормативтік дереккөз",
      present: "Карточкаларда бар", needsData: "Толықтыру қажет", seek: "Оқиғаны бейнеден ашу",
    },
    en: {
      note: "Only report completeness is checked. Populated fields do not confirm an observation's accuracy or compliance with cash-handling rules.",
      empty: "No events are marked. Event-card completeness is not assessed; this is not a conclusion that all requirements were met.",
      events: "Event cards", filled: "Populated fields", missing: "Missing fields",
      type: "Visible event type", time: "Event timestamp", observation: "Visible observation description", rationale: "Reason for review",
      frames: "1–3 frames with timestamps", source: "Supplied regulatory source",
      present: "Present in cards", needsData: "Needs information", seek: "Open event in video",
    },
  }[lang];

  const definitions: { id: string; label: string; check: (event: Violation) => boolean }[] = [
    { id: "type", label: t.type, check: (event) => Boolean(event.type.trim()) },
    { id: "time", label: t.time, check: (event) => Number.isFinite(event.timecode_sec) && event.timecode_sec >= 0 },
    { id: "observation", label: t.observation, check: (event) => Boolean(event.description.trim()) },
    { id: "rationale", label: t.rationale, check: (event) => Boolean(event.rationale?.trim()) },
    { id: "frames", label: t.frames, check: (event) => event.evidence_frames.length >= 1 && event.evidence_frames.length <= 3 && event.evidence_frames.every((frame) => Boolean(frame.image_base64.trim()) && Number.isFinite(frame.timestamp_sec) && frame.timestamp_sec >= 0) },
    { id: "source", label: t.source, check: (event) => Boolean(event.regulation?.trim() || event.regulation_article?.trim() || event.regulation_url?.trim()) },
  ];
  const checks = definitions.map((definition) => ({
    ...definition,
    present: violations.filter(definition.check).length,
    firstIncomplete: violations.find((event) => !definition.check(event)),
  }));
  const filled = checks.reduce((total, check) => total + check.present, 0);
  const total = violations.length * checks.length;

  if (!violations.length) {
    return <div className="card-corporate" style={{ padding: 20, fontSize: 13, lineHeight: 1.6, color: "var(--forte-text-secondary)" }}>{t.empty}</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <p style={{ fontSize: 12, lineHeight: 1.6, color: "var(--forte-text-muted)" }}>{t.note}</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10 }}>
        {[{ label: t.events, value: violations.length }, { label: t.filled, value: `${filled} / ${total}` }, { label: t.missing, value: total - filled }].map((metric) => (
          <div key={metric.label} className="card-corporate" style={{ padding: "12px 10px", textAlign: "center", background: "var(--forte-surface)" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: "var(--forte-text-primary)" }}>{metric.value}</div>
            <div style={{ fontSize: 11, color: "var(--forte-text-muted)", marginTop: 3 }}>{metric.label}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {checks.map((check) => {
          const complete = check.present === violations.length;
          const timestamp = check.firstIncomplete?.timecode_sec;
          return (
            <div key={check.id} className="card-corporate" style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, background: complete ? "var(--forte-surface)" : "var(--pastel-amber-bg)", borderColor: complete ? "var(--forte-border)" : "var(--pastel-amber-border)" }}>
              {complete ? <CheckCircleIcon style={{ width: 20, height: 20, flexShrink: 0, color: "var(--pastel-lime)" }} /> : <InformationCircleIcon style={{ width: 20, height: 20, flexShrink: 0, color: "var(--pastel-amber)" }} />}
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontSize: 13, fontWeight: 500, lineHeight: 1.45, color: "var(--forte-text-primary)" }}>{check.label}</span>
                <span style={{ display: "block", fontSize: 11, lineHeight: 1.5, marginTop: 3, color: "var(--forte-text-muted)" }}>{t.present}: {check.present} / {violations.length}{!complete && ` · ${t.needsData}`}</span>
              </div>
              {!complete && timestamp !== undefined && Number.isFinite(timestamp) && timestamp >= 0 && (
                onSeek ? <button type="button" className="badge-amber" title={t.seek} onClick={() => onSeek(timestamp)} style={{ cursor: "pointer", flexShrink: 0 }}><ClockIcon style={{ width: 12, height: 12 }} />{formatTime(timestamp)}</button>
                  : <span className="badge-amber" style={{ flexShrink: 0 }}><ClockIcon style={{ width: 12, height: 12 }} />{formatTime(timestamp)}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
