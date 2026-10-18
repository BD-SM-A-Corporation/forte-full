'use client';

import { ArrowDownToLine, ArrowUpRight, ShieldAlert, ClipboardCheck } from 'lucide-react';
import { ReviewAssessment, VerificationSummary } from '@/lib/types';

export function VerdictBanner({ assessment, verificationSummary, violationsCount, filename, onDownloadJson, onReset }: { assessment: ReviewAssessment | null; verificationSummary?: VerificationSummary | null; violationsCount: number; filename: string; onDownloadJson: () => void; onReset: () => void }) {
  const flagged = assessment?.status === 'potential_violation';
  const inconclusive = verificationSummary?.enabled && (verificationSummary.checked_count === 0 || verificationSummary.insufficient_count > 0 || verificationSummary.not_checked_count > 0 || verificationSummary.unavailable_count > 0);
  return <section className={`result-summary ${flagged ? 'flagged' : 'clear'}`}>
    <span className="result-summary-icon">{flagged ? <ShieldAlert size={25} /> : <ClipboardCheck size={25} />}</span>
    <div className="result-summary-body"><span className="eyebrow">ПРЕДВАРИТЕЛЬНЫЙ АНАЛИЗ · ОЖИДАЕТ ПРОВЕРКИ</span><h2>{flagged ? 'Найдены события для проверки' : inconclusive ? 'Недостаточно данных для вывода' : 'Совпадений с настроенными правилами не найдено'}</h2><p>{flagged ? `Событий для проверки: ${violationsCount}. Изучите фрагменты и подтверждающие кадры.` : inconclusive ? 'Часть условий неизвестна или не проверена. Причины показаны в проверке правил.' : 'Просмотрите запись: отсутствие совпадений не подтверждает отсутствие нарушения.'} Окончательное решение принимает человек.</p><span className="result-filename">{filename}</span></div>
    <div className="result-summary-actions"><button className="secondary-button" onClick={onDownloadJson}><ArrowDownToLine size={14} />Скачать JSON</button><button className="result-new-button" onClick={onReset}>Другая запись <ArrowUpRight size={14} /></button></div>
  </section>;
}
