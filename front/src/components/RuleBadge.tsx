import { ExternalLink, CheckCircle2 } from 'lucide-react';

interface RuleBadgeProps {
  source?: string | null;
  section?: string | null;
  url?: string | null;
  verified?: boolean;
  severity?: 'low' | 'medium' | 'high' | 'critical' | string;
}

export function RuleBadge({
  source = 'Правила ведения кассовых операций (НБРК № 200)',
  section = 'Глава 2, п. 14',
  url = 'https://adilet.zan.kz/rus/docs/V1900019818',
  verified = true,
  severity = 'high',
}: RuleBadgeProps) {
  const severityColors = {
    critical: 'bg-red-500/15 text-red-300 border-red-500/30',
    high: 'bg-[#a11042]/20 text-[#fca5a5] border-[#a11042]/40',
    medium: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    low: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  }[severity as string] || 'bg-zinc-800 text-zinc-300 border-zinc-700';

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-white/[0.08] bg-black/30 p-2.5 text-xs text-zinc-300">
      <div className="flex items-center gap-1.5 font-medium text-white">
        {verified && (
          <span title="Верифицировано в нормативной базе НБРК" className="flex items-center text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
          </span>
        )}
        <span className="text-zinc-200">{source}</span>
      </div>

      {section && (
        <span className="rounded bg-white/[0.06] px-2 py-0.5 font-mono text-[11px] text-zinc-300">
          {section}
        </span>
      )}

      {severity && (
        <span className={`rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${severityColors}`}>
          {severity}
        </span>
      )}

      {url && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto inline-flex items-center gap-1 text-[11px] font-medium text-[#c21350] hover:text-[#e2235e] hover:underline"
        >
          <span>adilet.zan.kz</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </div>
  );
}
