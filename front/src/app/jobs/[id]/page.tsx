'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { VerdictBanner } from '@/components/VerdictBanner';
import { Timeline } from '@/components/Timeline';
import { RuleChecks } from '@/components/RuleChecks';
import { VideoPlayer } from '@/components/VideoPlayer';
import { ViolationCard } from '@/components/ViolationCard';
import { EvidenceGallery } from '@/components/EvidenceGallery';
import { StageProgress } from '@/components/StageProgress';
import { ScanPreview } from '@/components/ScanPreview';
import { JobResponse } from '@/lib/types';
import { getJobStatus, juryResult } from '@/lib/api';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';

function JobDetailsInner() {
  const params = useParams();
  const router = useRouter();
  const rawId = params?.id;
  const jobId = typeof rawId === 'string' ? rawId : Array.isArray(rawId) ? rawId[0] : '';

  const [job, setJob] = useState<JobResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seekTargetTime, setSeekTargetTime] = useState<number | null>(null);
  const [activeViolationId, setActiveViolationId] = useState<number | null>(null);

  useEffect(() => {
    let isSubscribed = true;
    let terminal = false;
    const started = Date.now();

    async function fetchJob() {
      if (!jobId) return;

      try {
        const data = await getJobStatus(jobId);
        terminal = data.status === 'completed' || data.status === 'failed';
        if (isSubscribed) setJob(data);
      } catch (err: unknown) {
        terminal = true;
        if (isSubscribed) {
          setError(err instanceof Error ? err.message : 'Не удалось получить результат');
        }
      } finally {
        if (isSubscribed) setLoading(false);
      }
    }

    let timer: ReturnType<typeof setTimeout>;
    const poll = async () => {
      await fetchJob();
      if (isSubscribed && !terminal) {
        if (Date.now() - started >= 300000) setError('Превышен лимит ожидания 5 минут');
        else timer = setTimeout(poll, 2000);
      }
    };
    void poll();
    return () => {
      isSubscribed = false;
      clearTimeout(timer);
    };
  }, [jobId]);

  const handleSeek = (seconds: number) => {
    setSeekTargetTime(seconds);
    setCurrentTime(seconds);
  };

  const handleDownloadJson = () => {
    if (!job) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(juryResult(job), null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `forte_compliance_${job.job_id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>К экрану загрузки нового видео</span>
      </Link>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-sky-600" />
          <p className="text-sm text-slate-600">Загрузка данных анализа #{jobId}...</p>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center space-y-3">
          <AlertCircle className="h-8 w-8 text-red-700 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">Не удалось открыть запись #{jobId}</h2>
          <p className="text-xs text-slate-600">{error}</p>
        </div>
      ) : job && (job.status === 'processing' || job.status === 'pending' || job.status === 'failed') ? (
        <div className="py-8 space-y-6">
          <ScanPreview
            filename={job.filename}
            stageName="Обработка в фоновом режиме"
            progress={job.progress}
          />
          <StageProgress
            progress={job.progress}
            status={job.status}
            error={job.error}
          />
        </div>
      ) : job ? (
        <div className="space-y-8 animate-fadeIn">
          {/* Verdict Banner */}
          <VerdictBanner
            assessment={job.assessment}
            verificationSummary={job.verification_summary}
            violationsCount={job.violations_count}
            filename={job.filename}
            onDownloadJson={handleDownloadJson}
            onReset={() => router.push('/')}
          />

          {/* Video Player & Timeline */}
          <div className="space-y-4">
            <VideoPlayer
              violations={job.violations}
              currentTime={currentTime}
              onTimeUpdate={setCurrentTime}
              onDurationChange={setDuration}
              seekTime={seekTargetTime}
              onSeekComplete={() => setSeekTargetTime(null)}
            />

            <Timeline
              key={job.job_id}
              duration={job.video_duration_sec ?? duration}
              currentTime={currentTime}
              violations={job.violations}
              observations={job.observations}
              observationsStatus={job.observations_status}
              onSeek={handleSeek}
              activeViolationId={activeViolationId}
            />
          </div>

          <RuleChecks checks={job.rule_checks} summary={job.verification_summary} onSeek={handleSeek} />

          {/* Evidence Gallery */}
          {job.violations.length > 0 && (
            <EvidenceGallery
              violations={job.violations}
              jobId={job.job_id}
            />
          )}

          {/* Violations List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-lg font-bold text-slate-900">
                Совпадения с правилами ({job.violations.length})
              </h3>
              <span className="text-xs font-mono text-slate-600">
                ID: {job.job_id}
              </span>
            </div>

            {job.violations.length === 0 ? (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50 p-8 text-center space-y-2">
                <div className="text-emerald-800 font-bold text-base">
                  Совпадений с настроенными правилами не найдено
                </div>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  В рамках настроенных правил признаки нарушений не найдены. Требуется проверка человеком.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {job.violations.map((violation, idx) => (
                  <ViolationCard
                    key={violation.id || idx}
                    violation={violation}
                    index={idx}
                    isActive={activeViolationId === violation.id}
                    onSeek={handleSeek}
                    onSelect={() => {
                      setActiveViolationId(violation.id || null);
                      handleSeek(violation.timestamp_sec);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function JobDetailsPage() {
  return (
    <div className="min-h-screen flex flex-col text-slate-900 bg-cyber-grid">
      <Suspense fallback={null}>
        <Header />
      </Suspense>
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
              <Loader2 className="h-10 w-10 animate-spin text-sky-600" />
              <p className="text-sm text-slate-600">Инициализация страницы...</p>
            </div>
          }
        >
          <JobDetailsInner />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
