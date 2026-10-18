'use client';

import { Film, Loader2 } from 'lucide-react';

export function ScanPreview({ videoUrl, filename = 'Видеозапись', stageName }: { videoUrl?: string | null; filename?: string; stageName: string; progress: number }) {
  return <div className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white">
    <div className="aspect-video flex items-center justify-center bg-black">{videoUrl ? <video src={videoUrl} controls muted playsInline className="h-full w-full object-contain" /> : <Film className="text-zinc-600" size={48} />}</div>
    <div className="p-5 space-y-2"><p className="truncate text-sm font-medium">{filename}</p><p className="flex items-center gap-2 text-xs text-slate-600"><Loader2 size={14} className="animate-spin" />{stageName}</p><p className="text-xs text-zinc-500">Предпросмотр исходного видео</p></div>
  </div>;
}
