"use client";

import type { AnalysisResult } from "@/types";
import {
  CheckBadgeIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

interface ExecutiveVerdictCardProps {
  result: AnalysisResult;
  processingMs: number;
  onReset: () => void;
  lang?: "ru" | "kz" | "en";
}

export default function ExecutiveVerdictCard({
  result,
  processingMs,
  onReset,
  lang = "ru",
}: ExecutiveVerdictCardProps) {
  const isViolation = result.verdict === "violation";
  const violationsCount = result.violations.length;

  const t = {
    ru: {
      statusPassed: "Нарушение не обнаружено",
      statusFailed: "Обнаружены признаки возможных нарушений",
      descPassed: "События для дополнительного просмотра не отмечены. Это не подтверждение соблюдения всех правил кассовой дисциплины.",
      descFailed: "Отмечены визуальные события, которые нужно проверить в контексте записи. Наличие события само по себе не доказывает нарушение.",
      reviewNote: "Результат — подсказка уполномоченному сотруднику. Он не является юридическим или дисциплинарным заключением.",
      totalViolations: "Событий для просмотра",
      duration: "Время обработки",
      jobId: "ID проверки",
      newAudit: "Новый анализ",
    },
    kz: {
      statusPassed: "Бұзушылық анықталған жоқ",
      statusFailed: "Ықтимал бұзушылықтардың белгілері анықталды",
      descPassed: "Қосымша қарауға арналған оқиғалар белгіленбеген. Бұл кассалық тәртіптің барлық ережелері сақталғанын растамайды.",
      descFailed: "Жазба контексінде тексеруді қажет ететін визуалды оқиғалар белгіленді. Оқиғаның өзі бұзушылықты дәлелдемейді.",
      reviewNote: "Нәтиже уәкілетті қызметкерге көмек ретінде беріледі. Бұл заңдық немесе тәртіптік қорытынды емес.",
      totalViolations: "Қаралатын оқиғалар",
      duration: "Өңдеу уақыты",
      jobId: "Тексеру ID",
      newAudit: "Жаңа талдау",
    },
    en: {
      statusPassed: "No violation detected",
      statusFailed: "Signs of possible violations detected",
      descPassed: "No events are marked for further review. This does not confirm compliance with every cash-handling rule.",
      descFailed: "Visual events are marked for review in the context of the recording. An event alone does not prove a violation.",
      reviewNote: "This result assists an authorized reviewer. It is not a legal or disciplinary conclusion.",
      totalViolations: "Events for review",
      duration: "Processing time",
      jobId: "Job Reference",
      newAudit: "New analysis",
    },
  }[lang];

  return (
    <div
      className="card-corporate animate-fadeIn"
      style={{
        padding: "18px 20px",
        background: "var(--forte-surface)",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        borderTop: isViolation
          ? "4px solid var(--pastel-red)"
          : "4px solid var(--pastel-lime)",
      }}
    >
      {/* Top Status & Badge */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: "1 1 220px", minWidth: 0 }}>
          {isViolation ? (
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                backgroundColor: "var(--pastel-red-bg)",
                border: "1px solid var(--pastel-red-border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--pastel-red)",
                flexShrink: 0,
              }}
            >
              <ExclamationCircleIcon style={{ width: 22, height: 22 }} />
            </div>
          ) : (
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                backgroundColor: "var(--pastel-lime-bg)",
                border: "1px solid var(--pastel-lime-border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--pastel-lime)",
                flexShrink: 0,
              }}
            >
              <CheckBadgeIcon style={{ width: 22, height: 22 }} />
            </div>
          )}

          <div>
            <span
              className={isViolation ? "badge-red" : "badge-lime"}
              style={{ marginBottom: 4 }}
            >
              {isViolation ? t.statusFailed : t.statusPassed}
            </span>
            <p
              style={{
                fontSize: 12,
                color: "var(--forte-text-secondary)",
                marginTop: 4,
                lineHeight: 1.4,
              }}
            >
              {isViolation ? t.descFailed : t.descPassed}
            </p>
          </div>
        </div>

        <button
          type="button"
          className="btn-secondary"
          onClick={onReset}
          style={{ fontSize: 11, padding: "5px 10px", flexShrink: 0 }}
          title={t.newAudit}
        >
          <ArrowPathIcon style={{ width: 13, height: 13 }} />
          <span>{t.newAudit}</span>
        </button>
      </div>

      {/* Human review scope */}
      <div
        style={{
          padding: "12px 14px",
          borderRadius: 8,
          backgroundColor: "var(--forte-surface-2)",
          border: "1px solid var(--forte-border)",
        }}
      >
        <p style={{ fontSize: 12, lineHeight: 1.6, color: "var(--forte-text-secondary)" }}>{t.reviewNote}</p>
      </div>

      {/* Metrics Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 8,
        }}
      >
        <div
          style={{
            padding: "8px 10px",
            borderRadius: 6,
            backgroundColor: "var(--forte-surface-subtle)",
            border: "1px solid var(--forte-border)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: violationsCount > 0 ? "var(--pastel-red)" : "var(--forte-text-primary)",
            }}
          >
            {violationsCount}
          </div>
          <div style={{ fontSize: 10, color: "var(--forte-text-muted)", marginTop: 2 }}>
            {t.totalViolations}
          </div>
        </div>

        <div
          style={{
            padding: "8px 10px",
            borderRadius: 6,
            backgroundColor: "var(--forte-surface-subtle)",
            border: "1px solid var(--forte-border)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "var(--forte-text-primary)",
            }}
          >
            {(processingMs / 1000).toFixed(1)}s
          </div>
          <div style={{ fontSize: 10, color: "var(--forte-text-muted)", marginTop: 2 }}>
            {t.duration}
          </div>
        </div>

        <div
          style={{
            padding: "8px 10px",
            borderRadius: 6,
            backgroundColor: "var(--forte-surface-subtle)",
            border: "1px solid var(--forte-border)",
            textAlign: "center",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              fontFamily: "monospace",
              color: "var(--forte-brand)",
              textOverflow: "ellipsis",
              overflow: "hidden",
              whiteSpace: "nowrap",
            }}
          >
            {result.job_id}
          </div>
          <div style={{ fontSize: 10, color: "var(--forte-text-muted)", marginTop: 2 }}>
            {t.jobId}
          </div>
        </div>
      </div>
    </div>
  );
}
