'use client';

import { FactAssessment, RuleCheck, VerificationSummary } from '@/lib/types';
import { formatTimestamp } from '@/lib/api';
import { confidenceExplanation, formatConfidence } from '@/lib/confidence';

const statuses = {
  potential_match: 'Есть признаки для проверки',
  contradicted: 'Есть противоречащие признаки',
  insufficient_evidence: 'Недостаточно данных',
  not_checked: 'Не проверено',
  unavailable: 'Проверка не завершена',
};
const factStatuses = { confirmed: 'Подтверждено моделью', contradicted: 'Опровергнуто моделью', unknown: 'Неизвестно' };
const reasons: Record<string, string> = {
  check_limit: 'Достигнут лимит проверяемых эпизодов', time_budget: 'Не хватило времени на проверку',
  invalid_response: 'Не удалось получить проверяемый ответ модели', no_frames: 'Нет кадров для проверки',
  unknown_facts: 'Часть обязательных фактов неизвестна', episode_unconfirmed: 'Связь с одной операцией не подтверждена',
  low_confidence: 'Самооценка ниже настроенного порога', uncertainties: 'Остались неопределённости',
};

export function RuleChecks({ checks, summary, onSeek }: {
  checks: RuleCheck[]; summary: VerificationSummary | null; onSeek: (time: number) => void;
}) {
  const completed = checks.filter(check => check.status !== 'not_checked');
  const skipped = checks.filter(check => check.status === 'not_checked');
  const times = (values: number[]) => values.map(time => (
    <button key={time} type="button" onClick={() => onSeek(time)}
      className="rounded border border-slate-200 px-2 py-1 font-mono text-xs text-sky-700 hover:bg-sky-50 focus-visible:outline-2 focus-visible:outline-sky-600"
      aria-label={`Перейти к кадру ${formatTimestamp(time)}`}>{formatTimestamp(time)}</button>
  ));
  const fact = (assessment: FactAssessment, label: string, key: string) => (
    <li key={key} className="space-y-2 border-t border-slate-100 pt-3">
      <div className="flex flex-wrap items-start justify-between gap-2 text-sm">
        <span className="font-medium text-slate-800">{label}</span>
        <span className={`rounded px-2 py-0.5 text-xs ${assessment.status === 'unknown' ? 'bg-amber-50 text-amber-800' : assessment.status === 'confirmed' ? 'bg-sky-50 text-sky-800' : 'bg-slate-100 text-slate-700'}`}>{factStatuses[assessment.status]}</span>
      </div>
      <p className="break-words text-xs leading-relaxed text-slate-600">{assessment.explanation}</p>
      <div className="flex flex-wrap gap-2">{times(assessment.evidence_timestamps)}</div>
    </li>
  );

  return <section className="card-corporate space-y-4 p-4 sm:p-5" aria-label="Проверка условий правил">
    <div><h3 className="font-semibold text-slate-900">Проверка условий правил</h3>
      <p className="mt-1 text-xs leading-relaxed text-slate-500">Отдельный просмотр кадров с контекстом до и после события. Это ответы модели для проверки человеком.</p></div>
    {!summary?.enabled ? <p className="text-sm text-slate-600">Для этого результата отдельная проверка условий не выполнялась либо её подробности недоступны. Для старой записи нужен новый анализ.</p> : <>
      <p className="text-sm text-slate-700">Проверено эпизодов: {summary.checked_count} из {summary.candidate_count}. Не проверено: {summary.not_checked_count}. Незавершённых проверок: {summary.unavailable_count}.</p>
      {summary.candidate_count === 0 && <p className="text-sm text-amber-800">Первый проход не предложил действий для этих правил. Это не подтверждает отсутствие нарушения.</p>}
      {completed.map((check, index) => <details key={`${check.rule_id}-${index}`} className="rounded-lg border border-slate-200 p-3">
        <summary className="cursor-pointer text-sm font-medium text-slate-800">
          <span className="mr-2 font-mono text-xs">{formatTimestamp(check.start_sec)}–{formatTimestamp(check.end_sec)}</span>
          {check.rule_name}<span className="mt-1 block text-xs font-normal text-amber-800">{statuses[check.status]}</span>
        </summary>
        <div className="mt-3 space-y-3">
          <div className="flex flex-wrap gap-2">{times([check.start_sec])}</div>
          {check.reason && <p className="text-sm text-amber-800">{reasons[check.reason] ?? check.reason}</p>}
          {check.context_start_sec != null && check.context_end_sec != null && <p className="text-xs text-slate-500">Контекст: {formatTimestamp(check.context_start_sec)}–{formatTimestamp(check.context_end_sec)}. Кадров: {check.sampled_timestamps?.length ?? 0}.</p>}
          {check.confidence != null && <p className="text-xs text-slate-600" title={confidenceExplanation}>Самооценка проверки: {formatConfidence(check.confidence)}. Не вероятность нарушения.</p>}
          <ul className="space-y-3">
            {check.facts.map(item => fact(item, item.label, item.id))}
            {check.episode_link && fact(check.episode_link, 'Факты относятся к одной операции и тем же участникам', 'episode_link')}
          </ul>
          {!!check.blocking_reasons?.length && <ul className="list-disc space-y-1 pl-4 text-xs text-amber-800">{check.blocking_reasons.map(reason => <li key={reason}>{reasons[reason] ?? reason}</li>)}</ul>}
          {!!check.uncertainties?.length && <p className="break-words text-xs text-slate-600">Неопределённости: {check.uncertainties.join('; ')}</p>}
          <a href={check.source.url} target="_blank" rel="noreferrer" className="block text-xs text-sky-700 underline">{check.source.section} · Нормативный источник</a>
        </div>
      </details>)}
      {skipped.length > 0 && <details className="rounded-lg border border-amber-200 bg-amber-50 p-3">
        <summary className="cursor-pointer text-sm text-amber-900">Непроверенные эпизоды ({skipped.length})</summary>
        <ul className="mt-3 max-h-64 space-y-3 overflow-auto text-xs">{skipped.map((check, index) => <li key={`${check.rule_id}-${index}`} className="space-y-1"><p className="text-slate-800">{check.rule_name}</p><div className="flex flex-wrap items-center gap-2">{times([check.start_sec])}<span className="text-amber-800">{reasons[check.reason ?? ''] ?? 'Не проверено'}</span></div></li>)}</ul>
      </details>}
      <p className="text-xs text-slate-500">«Неизвестно» и «не проверено» не означают соблюдение правила. Противоречие относится к конкретному условию в данном эпизоде.</p>
    </>}
  </section>;
}
