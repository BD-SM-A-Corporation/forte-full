'use client';

import React, { useId, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { AlertCircle, Clock, MessageSquareText, X } from 'lucide-react';
import { ObservationResponse, ViolationResponse } from '@/lib/types';
import { formatTimestamp } from '@/lib/api';
import { confidenceExplanation, formatConfidence } from '@/lib/confidence';
import { buildTimelineEvents, eventsAtTime, groupTimelineEvents } from '@/lib/timeline';

interface TimelineProps {
  duration: number;
  currentTime: number;
  violations: ViolationResponse[];
  observations: ObservationResponse[];
  observationsStatus: 'available' | 'unavailable';
  onSeek: (seconds: number) => void;
  activeViolationId?: number | null;
}

export function Timeline({ duration, currentTime, violations, observations, observationsStatus, onSeek, activeViolationId }: TimelineProps) {
  const panelId = useId();
  const reduced = useReducedMotion();
  const [preview, setPreview] = useState<{ groupId: string } | { time: number } | null>(null);
  const events = useMemo(() => buildTimelineEvents(observations, violations), [observations, violations]);
  const totalDuration = duration > 0 ? duration : Math.max(1, ...events.map(event => event.end));
  const groups = useMemo(() => groupTimelineEvents(events, totalDuration), [events, totalDuration]);
  const previewEvents = preview && 'groupId' in preview
    ? groups.find(group => group[0].id === preview.groupId) ?? []
    : preview ? eventsAtTime(events, preview.time) : [];
  const percent = (time: number) => Math.min(100, Math.max(0, time / totalDuration * 100));

  const inspectPosition = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse') return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width > 0) setPreview({ time: Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)) * totalDuration });
  };

  return (
    <div
      className="w-full rounded-xl border border-slate-200 bg-white p-4 space-y-4 backdrop-blur-md"
      onKeyDown={event => { if (event.key === 'Escape') setPreview(null); }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-sky-600" />
          <span className="font-semibold text-slate-900">Таймлайн записи</span>
          <span>{events.length} наблюдений и событий</span>
        </div>
        <span className="font-mono text-slate-700">{formatTimestamp(currentTime)} / {formatTimestamp(totalDuration)}</span>
      </div>

      <div className="relative h-16" onPointerMove={inspectPosition}>
        {groups.map(group => {
          const first = group[0];
          const matched = group.some(event => event.rules.length > 0);
          const selected = previewEvents.some(event => group.includes(event)) ||
            (activeViolationId != null && group.some(event => event.violationId === activeViolationId));
          return (
            <motion.button
              initial={{ opacity: 0, scale: reduced ? 1 : 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={reduced ? undefined : { y: -3 }}
              whileTap={reduced ? undefined : { scale: 0.95 }}
              key={first.id}
              type="button"
              aria-label={`${formatTimestamp(first.start)}: ${group.length} наблюдений. Показать описание модели`}
              aria-controls={panelId}
              aria-expanded={preview !== null && 'groupId' in preview && preview.groupId === first.id}
              onPointerEnter={() => setPreview({ groupId: first.id })}
              onPointerMove={event => event.stopPropagation()}
              onFocus={() => setPreview({ groupId: first.id })}
              onClick={() => { setPreview({ groupId: first.id }); onSeek(first.start); }}
              className={`absolute top-0 z-20 flex h-8 min-w-8 items-center justify-center gap-1 rounded-full border px-1.5 text-xs font-semibold shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 ${matched ? 'border-rose-400 bg-rose-50 text-rose-800' : 'border-sky-400 bg-sky-50 text-sky-800'} ${selected ? 'ring-2 ring-sky-500/70' : ''}`}
              style={{ left: `clamp(0px, calc(${percent(first.start)}% - 16px), calc(100% - 40px))` }}
            >
              {matched ? <AlertCircle className="h-3.5 w-3.5" /> : <MessageSquareText className="h-3.5 w-3.5" />}
              {group.length > 1 && <span>{group.length}</span>}
            </motion.button>
          );
        })}

        <div className="absolute inset-x-0 bottom-1 h-4 rounded bg-slate-200">
          {events.map(event => (
            <motion.div initial={{ scaleX: reduced ? 1 : 0 }} animate={{ scaleX: 1 }} transition={{ duration: reduced ? 0 : 0.5 }} key={event.id} className={`absolute inset-y-0 rounded ${event.rules.length ? 'bg-rose-500/40' : 'bg-sky-400/25'}`}
              style={{ transformOrigin: "left", left: `${percent(event.start)}%`, width: `${Math.max(0, percent(event.end) - percent(event.start))}%` }} />
          ))}
          <motion.div className="absolute inset-y-0 left-0 rounded bg-sky-500/15" initial={false} animate={{ width: `${percent(currentTime)}%` }} transition={{ duration: reduced ? 0 : 0.15, ease: "linear" }} />
          <motion.div className="pointer-events-none absolute -inset-y-1 w-0.5 bg-sky-700" initial={false} animate={{ left: `min(${percent(currentTime)}%, calc(100% - 2px))` }} transition={{ duration: reduced ? 0 : 0.15, ease: "linear" }} />
        </div>
        <input
          type="range" min={0} max={totalDuration} step={0.01}
          value={Math.min(totalDuration, Math.max(0, currentTime))}
          aria-label="Позиция на таймлайне"
          aria-valuetext={formatTimestamp(currentTime)}
          aria-controls={panelId}
          onFocus={() => setPreview({ time: currentTime })}
          onChange={event => { const time = Number(event.target.value); setPreview({ time }); onSeek(time); }}
          className="absolute inset-x-0 bottom-0 z-10 h-6 w-full cursor-pointer opacity-0 focus-visible:opacity-100 accent-rose-500"
        />
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-slate-600">
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-sky-400" />Наблюдение модели</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-400" />Совпадение с правилом — нужна проверка</span>
      </div>

      {observationsStatus === 'unavailable' && (
        <p className="text-xs text-amber-800">Подробные наблюдения недоступны. Показаны только сохранённые совпадения с правилами. Обновите страницу, чтобы повторить загрузку.</p>
      )}

      <section id={panelId} aria-label="Описание модели для фрагмента" className="rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Что описала модель</h3>
            <p className="mt-1 text-xs text-slate-600">Наведите на шкалу или маркер. Нажатие перемещает запись. Описание остаётся открытым для чтения.</p>
          </div>
          {preview && <button type="button" onClick={() => setPreview(null)} aria-label="Закрыть описание фрагмента" className="rounded p-1 text-slate-600 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-sky-600"><X className="h-4 w-4" /></button>}
        </div>

        {preview && previewEvents.length === 0 && (
          <p className="mt-3 text-sm text-slate-600">В этой точке нет сохранённого наблюдения. Это не означает отсутствие нарушения.</p>
        )}
        {!preview && events.length === 0 && observationsStatus === 'available' && (
          <p className="mt-3 text-sm text-slate-600">Модель не вернула наблюдений для этой записи.</p>
        )}
        {previewEvents.length > 0 && (
          <div className="mt-4 max-h-80 space-y-4 overflow-y-auto overscroll-contain pr-1">
            {previewEvents.map(event => (
              <article key={event.id} className="space-y-2 border-t border-slate-200 pt-3 first:border-0 first:pt-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <button type="button" onClick={() => onSeek(event.start)} className="rounded font-mono text-xs text-sky-700 underline decoration-sky-300/40 underline-offset-4 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-sky-600" aria-label={`Перейти к ${formatTimestamp(event.start)}`}>
                    {formatTimestamp(event.start)} — {formatTimestamp(event.end)}
                  </button>
                  <span className="text-xs text-slate-700" title={confidenceExplanation}>Самооценка: {formatConfidence(event.confidence)}</span>
                </div>
                <h4 className="text-sm font-semibold text-slate-900">{event.title}</h4>
                <p className="text-[11px] text-zinc-500">{event.originalObservation ? 'Исходное описание модели, без перевода' : 'Сохранённое описание совпадения; исходное наблюдение недоступно'}</p>
                <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-700">{event.description}</p>
                <div className="text-xs text-slate-600">
                  <span className="font-medium text-slate-700">Неопределённости: </span>
                  {event.uncertainties.length ? <ul className="mt-1 list-disc space-y-1 pl-4">{event.uncertainties.map((text, index) => <li key={index} className="break-words">{text}</li>)}</ul> : 'не указаны моделью'}
                </div>
                {event.evidence.length > 0 && <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">Опорные кадры: {event.evidence.map(time => <button key={time} type="button" onClick={() => onSeek(time)} className="rounded border border-slate-200 px-2 py-1 font-mono text-slate-700 hover:border-sky-400 focus-visible:outline-2 focus-visible:outline-sky-600" aria-label={`Перейти к опорному кадру ${formatTimestamp(time)}`}>{formatTimestamp(time)}</button>)}</div>}
                {event.rules.length > 0 && <p className="break-words text-xs text-sky-700">Совпадения: {event.rules.join('; ')}. Требуется проверка человеком.</p>}
              </article>
            ))}
          </div>
        )}
        {previewEvents.length > 0 && <p className="mt-3 border-t border-slate-200 pt-3 text-[11px] text-zinc-500">{confidenceExplanation} Описание может содержать ошибки и не является окончательным решением.</p>}
      </section>
    </div>
  );
}
