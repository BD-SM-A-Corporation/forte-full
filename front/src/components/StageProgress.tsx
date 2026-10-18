'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Clock, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import type { Language } from '@/lib/translations';
import styles from './StageProgress.module.css';

export function StageProgress({ status, error, onRetry, lang = 'ru' }: { progress: number; status: 'pending' | 'processing' | 'completed' | 'failed'; error?: string | null; onRetry?: () => void; lang?: Language }) {
  const [elapsed, setElapsed] = useState(0);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (status !== 'processing') return;
    const started = Date.now();
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - started) / 1000)), 1000);
    return () => clearInterval(timer);
  }, [status]);
  const t = {
    ru: { limit: 'Лимит: 5 минут', failed: 'Анализ не завершён. Результат недоступен.', retry: 'Вернуться к загрузке', complete: 'Анализ завершён', waiting: 'Ожидаем результат анализа', progress: 'Обработка записи' },
    kz: { limit: 'Шектеу: 5 минут', failed: 'Талдау аяқталмады. Нәтиже қолжетімсіз.', retry: 'Жүктеуге оралу', complete: 'Талдау аяқталды', waiting: 'Талдау нәтижесін күтеміз', progress: 'Бейнені өңдеу' },
    en: { limit: 'Limit: 5 minutes', failed: 'Analysis did not complete. Result unavailable.', retry: 'Back to upload', complete: 'Analysis complete', waiting: 'Waiting for analysis results', progress: 'Processing recording' },
  }[lang];
  const running = status === 'processing';
  return <div className={styles.panel}>
    <div className={styles.timing}><span><Clock size={12} /><span role="timer" aria-live="off">{Math.floor(elapsed / 60).toString().padStart(2, '0')}:{(elapsed % 60).toString().padStart(2, '0')}</span></span><span>{t.limit}</span></div>
    <AnimatePresence mode="wait" initial={false}>
      {status === 'failed' ? <motion.div key="failed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.error} role="alert"><p><AlertCircle size={18} />{error || t.failed}</p>{onRetry && <button onClick={onRetry} className="btn-secondary"><ArrowLeft size={14} />{t.retry}</button>}</motion.div> : <motion.div key="status" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className={styles.track} role="progressbar" aria-label={t.progress} aria-valuenow={status === 'completed' ? 100 : undefined}>
          <motion.span initial={false} animate={running && !reduced ? { x: ['-100%', '340%'] } : { x: 0 }} transition={running && !reduced ? { duration: 2.2, repeat: Infinity, ease: 'easeInOut' } : { duration: 0 }} style={{ width: status === 'completed' || reduced ? '100%' : '30%', opacity: reduced && running ? 0.5 : 1 }} />
        </div>
        <p className={styles.status} role="status">{status === 'completed' && <CheckCircle2 size={14} />}{status === 'completed' ? t.complete : t.waiting}</p>
      </motion.div>}
    </AnimatePresence>
  </div>;
}
