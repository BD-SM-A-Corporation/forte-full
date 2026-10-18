'use client';

import { useEffect, useState } from 'react';
import { X, ImageIcon, Download } from 'lucide-react';
import { ViolationResponse } from '@/lib/types';
import { formatTimestamp } from '@/lib/api';

export function EvidenceGallery({ violations }: { violations: ViolationResponse[]; jobId: string }) {
  const frames = violations.flatMap(v => (v.evidence_frames || (v.frame_b64 ? [{ timestamp_sec: v.timestamp_sec, image_base64: v.frame_b64 }] : [])).map(frame => ({ ...frame, title: v.title, description: v.description })));
  const [active, setActive] = useState<number | null>(null);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setActive(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  const source = (value: string) => value.startsWith('data:') ? value : `data:image/jpeg;base64,${value}`;
  const selected = active === null ? null : frames[active];
  return <section className="glass-panel rounded-2xl p-5 space-y-4">
    <h3 className="flex items-center gap-2 font-semibold"><ImageIcon size={18} /> Кадры-доказательства <span className="text-zinc-500">{frames.length}</span></h3>
    {frames.length === 0 && <p className="text-sm text-slate-600">Сервер не предоставил кадры-доказательства.</p>}
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{frames.map((frame, i) => <button key={i} onClick={() => setActive(i)} className="overflow-hidden rounded-xl border border-slate-200 text-left hover:border-rose-400 focus-visible:outline-2 focus-visible:outline-rose-400">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={source(frame.image_base64)} alt={`${frame.title}, ${formatTimestamp(frame.timestamp_sec)}`} className="aspect-video w-full object-contain bg-black" />
      <div className="p-3"><span className="font-mono text-xs text-sky-700">{formatTimestamp(frame.timestamp_sec)}</span><p className="mt-1 text-sm">{frame.title}</p></div>
    </button>)}</div>
    {selected && <div role="dialog" aria-modal="true" aria-label="Кадр-доказательство" className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setActive(null)}>
      <div className="max-w-4xl max-h-[90vh] overflow-auto rounded-2xl border border-slate-200 bg-white p-5 space-y-4" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between gap-4"><h3>{selected.title} · {formatTimestamp(selected.timestamp_sec)}</h3><button autoFocus aria-label="Закрыть" onClick={() => setActive(null)}><X /></button></div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={source(selected.image_base64)} alt={selected.title} className="max-h-[60vh] w-full object-contain" />
        <p className="text-sm text-slate-700">{selected.description}</p>
        <a href={source(selected.image_base64)} download={`evidence-${selected.timestamp_sec}.jpg`} className="inline-flex items-center gap-2 text-sm text-sky-700"><Download size={16} />Скачать кадр</a>
      </div>
    </div>}
  </section>;
}
