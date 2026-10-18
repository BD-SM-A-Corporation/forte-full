'use client';

import { useEffect, useState } from 'react';
import { ArrowUpRight, RefreshCw } from 'lucide-react';
import { getRules } from '@/lib/api';
import { RuleCatalogue as Catalogue } from '@/lib/types';

export function RuleCatalogue() {
  const [catalogue, setCatalogue] = useState<Catalogue | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let cancelled = false;
    getRules().then(value => {
      if (!cancelled) setCatalogue(value);
    }).catch(reason => {
      if (!cancelled) setError(reason instanceof Error ? reason.message : 'Не удалось загрузить правила');
    });
    return () => { cancelled = true; };
  }, [revision]);

  if (error) return <section role="alert" className="glass-panel rounded-2xl p-6">
    <h2 className="font-semibold text-amber-800">Реестр недоступен</h2>
    <p className="mt-2 text-sm text-slate-600">{error}</p>
    <button className="secondary-button mt-4" onClick={() => { setError(null); setCatalogue(null); setRevision(value => value + 1); }}><RefreshCw size={14} />Повторить загрузку</button>
  </section>;
  if (!catalogue) return <p role="status" className="text-sm text-slate-600">Загружаем действующий реестр…</p>;
  if (!catalogue.rules.length) return <section className="glass-panel rounded-2xl p-6">
    <h2 className="font-semibold text-amber-800">Правила пока не настроены</h2>
    <p className="mt-2 text-sm text-slate-600">Сервис вернул пустой реестр. Для анализа необходимо настроить правила с нормативными основаниями.</p>
  </section>;

  const detectors = catalogue.rules.filter(rule => rule.kind === 'potential_violation');
  const context = catalogue.rules.filter(rule => rule.kind === 'context');
  return <section className="space-y-5" aria-label="Действующий реестр правил">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div><h2 className="text-2xl font-semibold">Нормативный реестр</h2><p className="mt-2 text-sm text-slate-600">Правил проверки: {detectors.length} · Оснований для уточнения: {context.length}</p></div>
      <span className="subtle-badge">Окончательное решение принимает человек</span>
    </div>
    {!catalogue.configured && <p role="status" className="text-sm text-amber-800">В реестре есть контекстные основания, но правила формирования сигналов ещё не настроены.</p>}
    <p className="text-sm text-slate-600">Сигнал формируется при наличии всех необходимых видимых фактов. Контекстные основания помогают проверить эпизод и сами по себе не означают нарушение.</p>
    {[{ title: 'Проверка визуальных признаков', rules: detectors }, { title: 'Контекст для проверяющего', rules: context }].filter(group => group.rules.length > 0).map(group => <div key={group.title} className="space-y-3">
      <h3 className="text-lg font-semibold">{group.title}</h3>
      {group.rules.map(rule => <article key={rule.id} className="glass-panel rounded-2xl p-6">
        <h4 className="font-semibold">{rule.name}</h4>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">{rule.applicability}</p>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">{rule.explanation_template}</p>
        <a className="mt-4 inline-flex items-center gap-2 text-sm text-sky-700 hover:text-sky-800" href={rule.source.url} target="_blank" rel="noopener noreferrer">{rule.source.document} · {rule.source.section}<ArrowUpRight size={14} className="shrink-0" /></a>
        <details className="mt-3 text-sm text-slate-600"><summary className="cursor-pointer">Текст основания · сверен {rule.source.verified_on}</summary><blockquote className="mt-3 border-l-2 border-slate-200 pl-4 leading-relaxed">{rule.source.excerpt}</blockquote><p className="mt-2 text-xs">Сверка текста источника не подтверждает точность распознавания событий моделью.</p></details>
      </article>)}
    </div>)}
  </section>;
}
