"use client";

import { useEffect, useRef, useState } from "react";
import { FilmIcon } from "@heroicons/react/24/outline";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, Clock3, FileVideo2, ScanLine, ShieldCheck, Sparkles } from "lucide-react";
import { AnalysisVisual } from "@/components/AnalysisVisual";
import { motionCopy } from "@/lib/motion-copy";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import DropZone from "@/components/DropZone";
import { StageProgress } from "@/components/StageProgress";
import { VerdictBanner } from "@/components/VerdictBanner";
import { Timeline } from "@/components/Timeline";
import { RuleChecks } from "@/components/RuleChecks";
import { VideoPlayer } from "@/components/VideoPlayer";
import { ViolationCard } from "@/components/ViolationCard";
import { EvidenceGallery } from "@/components/EvidenceGallery";
import { JobResponse } from "@/lib/types";
import { uploadVideo, getJobStatus, juryResult } from "@/lib/api";
import { translations } from "@/lib/translations";
import { workspaceTranslations } from "@/lib/workspace-translations";
import { useLanguage } from "@/lib/use-language";
import styles from "./page.module.css";

type ScreenStep = "upload" | "processing" | "result";

export default function CashDisciplineApp() {
  const [lang, setLang] = useLanguage();
  const t = translations[lang];
  const design = motionCopy[lang];
  const reduced = useReducedMotion();
  const enter = { initial: { opacity: 0, y: reduced ? 0 : 12 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: reduced ? 0 : -8 } };
  const copy = workspaceTranslations[lang];
  const [currentStep, setCurrentStep] = useState<ScreenStep>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoObjectUrl, setVideoObjectUrl] = useState<string | null>(null);

  // Processing state
  const [progress, setProgress] = useState(0);
  const [jobStatus, setJobStatus] = useState<'pending' | 'processing' | 'completed' | 'failed'>('pending');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Result state
  const [jobResult, setJobResult] = useState<JobResponse | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seekTargetTime, setSeekTargetTime] = useState<number | null>(null);
  const [activeViolationId, setActiveViolationId] = useState<number | null>(null);

  const playerSectionRef = useRef<HTMLDivElement>(null);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (videoObjectUrl) {
        URL.revokeObjectURL(videoObjectUrl);
      }
    };
  }, [videoObjectUrl]);

  const runRef = useRef(0);
  useEffect(() => () => { runRef.current += 1; }, []);

  const handleStartAnalysis = async (file: File | null) => {
    if (!file) return;
    const run = ++runRef.current;
    setSelectedFile(file);

    setErrorMessage(null);
    setProgress(5);
    setCurrentStep('processing');
    setJobStatus('processing');

    const started = Date.now();
    try {
      const init = await uploadVideo(file);
      if (run !== runRef.current) return;
      setProgress(15);
      while (run === runRef.current) {
        if (Date.now() - started >= 300000) throw new Error('Превышен лимит ожидания 5 минут. Результат недоступен.');
        const job = await getJobStatus(init.job_id);
        if (run !== runRef.current) return;
        if (job.status === 'failed') throw new Error(job.error || 'Ошибка обработки видео');
        if (job.status === 'completed') {
          setProgress(100);
          setJobStatus('completed');
          setJobResult({ ...job, filename: file.name });
          setCurrentStep('result');
          return;
        }
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    } catch (error) {
      if (run !== runRef.current) return;
      setJobStatus('failed');
      setErrorMessage(error instanceof Error ? error.message : 'Не удалось выполнить анализ');
    }
  };

  const handleSeek = (seconds: number) => {
    setSeekTargetTime(seconds);
    setCurrentTime(seconds);
    playerSectionRef.current?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'nearest' });
  };

  const handleDownloadJson = () => {
    if (!jobResult) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(juryResult(jobResult), null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `forte_compliance_${jobResult.job_id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleReset = () => {
    runRef.current += 1;
    setErrorMessage(null);
    setActiveViolationId(null);
    setSeekTargetTime(null);
    setVideoObjectUrl(null);
    setSelectedFile(null);
    setJobResult(null);
    setProgress(0);
    setJobStatus('pending');
    setCurrentTime(0);
    setDuration(0);
    setCurrentStep('upload');
  };

  const selectVideo = (file: File) => {
    handleReset();
    setSelectedFile(file);
    setVideoObjectUrl(URL.createObjectURL(file));
  };

  const labels = {
    ru: { start: "Начать анализ", ready: "Видео готово к анализу", readyDescription: "Запустите проверку: здесь появятся события, наблюдения модели и кадры-доказательства.", processing: "Анализируем запись", complete: "Анализ завершён", events: "События для проверки", empty: "Совпадений с правилами не найдено", timeout: "Обычно анализ занимает до 5 минут. Точный процент готовности сервер не передаёт." },
    kz: { start: "Талдауды бастау", ready: "Бейне талдауға дайын", readyDescription: "Тексеруді бастаңыз: оқиғалар, модель бақылаулары және дәлел кадрлары осында көрсетіледі.", processing: "Бейне талдануда", complete: "Талдау аяқталды", events: "Тексерілетін оқиғалар", empty: "Ережелермен сәйкестік табылмады", timeout: "Талдау әдетте 5 минутқа дейін созылады. Сервер дайындықтың нақты пайызын бермейді." },
    en: { start: "Start analysis", ready: "Video ready for analysis", readyDescription: "Start the review to see events, model observations and evidence frames here.", processing: "Analyzing recording", complete: "Analysis complete", events: "Events for review", empty: "No rule matches found", timeout: "Analysis usually takes up to 5 minutes. The server does not report exact progress." },
  }[lang];

  const workflowStep = currentStep === "result" ? 2 : currentStep === "processing" ? 1 : 0;
  const statusLabel = jobStatus === "failed" ? copy.failed : currentStep === "result" ? labels.complete : currentStep === "processing" ? labels.processing : selectedFile ? copy.videoSelected : copy.waiting;

  return (
    <div className={styles.page}>
      <Header currentLang={lang} onLanguageChange={setLang} onGoHome={handleReset} />
      <main className={styles.main}>
        <motion.div className={styles.intro} {...enter}>
          <div className={styles.introCopy}>
            <div className={styles.eyebrow}><span />FORTE COMPLIANCE <span className={styles.divider}>/</span> {design.workspace}</div>
            <h1>{t.brandTagline}<span className={styles.titleDot}>.</span></h1>
            <p>{copy.subtitle}</p>
          </div>
          <div className={styles.introAside}>
            <span className={styles.localBadge}><ShieldCheck size={15} />{design.local}</span>
            <span>{design.human}</span>
          </div>
        </motion.div>

        <motion.ol className={styles.workflow} aria-label={design.workflow} {...enter} transition={{ delay: reduced ? 0 : 0.06 }}>
          {[design.upload, design.analyze, design.review].map((label, index) => (
            <li key={index} data-current={workflowStep === index} data-complete={workflowStep > index} aria-current={workflowStep === index ? "step" : undefined}>
              {workflowStep === index && <motion.span className={styles.workflowActive} layoutId="workflow-active" transition={{ type: "spring", stiffness: 340, damping: 34 }} />}
              <span className={styles.workflowNumber}>{workflowStep > index ? <Check size={13} /> : `0${index + 1}`}</span>
              <span>{label}</span>
              {index < 2 && <ArrowRight size={14} className={styles.workflowArrow} />}
            </li>
          ))}
        </motion.ol>

        <div className={styles.workspace}>
          <motion.section className={styles.column} aria-labelledby="upload-title" ref={playerSectionRef} {...enter} transition={{ delay: reduced ? 0 : 0.12 }}>
            <div className={styles.sectionHeading}>
              <div className={styles.headingLabel}><FileVideo2 size={17} /><h2 id="upload-title">{copy.uploadTitle}</h2></div>
              <span className={styles.hint}>{copy.singleVideo}</span>
            </div>
            <AnimatePresence mode="wait" initial={false}>
              {videoObjectUrl ? <motion.div key={videoObjectUrl} className={styles.videoPanel} {...enter}>
                <div className={styles.fileBar}>
                  <span className={styles.fileIcon}><FilmIcon width={18} height={18} aria-hidden="true" /></span>
                  <span title={selectedFile?.name}>{selectedFile?.name}<small>{selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(1)} MB` : ""} · MOV</small></span>
                  <button className="btn-secondary" onClick={handleReset}>{copy.replaceVideo}</button>
                </div>
                <VideoPlayer videoUrl={videoObjectUrl} violations={jobResult?.violations ?? []} currentTime={currentTime} onTimeUpdate={setCurrentTime} onDurationChange={setDuration} seekTime={seekTargetTime} onSeekComplete={() => setSeekTargetTime(null)} lang={lang} />
              </motion.div> : <motion.div key="dropzone" {...enter}><DropZone onFile={selectVideo} lang={lang} /></motion.div>}
            </AnimatePresence>
            <AnimatePresence>
              {jobResult && <motion.div className={styles.resultStack} key={jobResult.job_id} {...enter}>
                <div className={styles.metrics}>
                  <div><span>{design.events}</span><strong>{jobResult.violations.length.toString().padStart(2, "0")}</strong></div>
                  <div><span>{design.observations}</span><strong>{jobResult.observations_status === "available" ? jobResult.observations.length.toString().padStart(2, "0") : "—"}</strong></div>
                  <div><span>{design.duration}</span><strong>{jobResult.video_duration_sec != null || duration > 0 ? `${Math.floor((jobResult.video_duration_sec ?? duration) / 60)}:${Math.floor((jobResult.video_duration_sec ?? duration) % 60).toString().padStart(2, "0")}` : "—"}</strong></div>
                </div>
                <Timeline duration={jobResult.video_duration_sec ?? duration} currentTime={currentTime} violations={jobResult.violations} observations={jobResult.observations} observationsStatus={jobResult.observations_status} onSeek={handleSeek} activeViolationId={activeViolationId} />
                {jobResult.violations.length > 0 && <EvidenceGallery violations={jobResult.violations} jobId={jobResult.job_id} />}
              </motion.div>}
            </AnimatePresence>
            {!jobResult && <p className={styles.videoNote}><ShieldCheck size={14} />{design.videoNote}</p>}
          </motion.section>

          <motion.section className={styles.column} aria-labelledby="analysis-title" {...enter} transition={{ delay: reduced ? 0 : 0.18 }}>
            <div className={styles.sectionHeading}>
              <div className={styles.headingLabel}><ScanLine size={17} /><h2 id="analysis-title">{copy.analysisTitle}</h2></div>
              <span className={styles.status} data-state={jobStatus} role="status"><i />{statusLabel}</span>
            </div>
            <AnimatePresence mode="wait" initial={false}>
              {currentStep === "upload" && <motion.div key={selectedFile ? "ready" : "empty"} className={styles.emptyState} {...enter}>
                <div className={styles.panelEyebrow}><Sparkles size={13} />{design.assistant}</div>
                <AnalysisVisual ready={!!selectedFile} lang={lang} />
                <h3>{selectedFile ? labels.ready : design.emptyTitle}</h3>
                <p>{selectedFile ? labels.readyDescription : copy.emptyDescription}</p>
                {selectedFile ? <motion.button className={`btn-primary ${styles.startButton}`} whileHover={reduced ? undefined : { y: -2 }} whileTap={reduced ? undefined : { scale: 0.98 }} onClick={() => void handleStartAnalysis(selectedFile)}>{labels.start}<ArrowRight size={17} /></motion.button> : <span className={styles.waitingHint}><Clock3 size={13} />{copy.waiting}</span>}
              </motion.div>}
              {currentStep === "processing" && <motion.div key="processing" className={styles.processingPanel} {...enter}>
                <div className={styles.panelEyebrow}><ScanLine size={13} />{design.assistant}</div>
                {jobStatus !== "failed" && <AnalysisVisual active lang={lang} />}
                <h3>{jobStatus === "failed" ? copy.failedTitle : labels.processing}</h3>
                <StageProgress progress={progress} status={jobStatus} error={errorMessage} onRetry={handleReset} lang={lang} />
                <p className={styles.processingNote}>{labels.timeout}</p>
              </motion.div>}
              {currentStep === "result" && jobResult && <motion.div key="result" className={styles.resultStack} {...enter}>
                <VerdictBanner assessment={jobResult.assessment} verificationSummary={jobResult.verification_summary} violationsCount={jobResult.violations_count} filename={jobResult.filename} onDownloadJson={handleDownloadJson} onReset={handleReset} />
                <RuleChecks checks={jobResult.rule_checks} summary={jobResult.verification_summary} onSeek={handleSeek} />
                <div className={styles.eventsHeading}><h3>{labels.events}</h3><span>{jobResult.violations.length}</span></div>
                {jobResult.violations.length === 0 ? <div className={`card-corporate ${styles.noEvents}`}><ShieldCheck size={22} /><p>{labels.empty}</p></div> : jobResult.violations.map((violation, index) => <ViolationCard key={violation.id ?? index} violation={violation} index={index} isActive={activeViolationId === violation.id} onSeek={handleSeek} onSelect={() => { setActiveViolationId(violation.id ?? null); handleSeek(violation.timestamp_sec); }} />)}
              </motion.div>}
            </AnimatePresence>
          </motion.section>
        </div>
        {currentStep === "upload" && <motion.div className={styles.guide} {...enter} transition={{ delay: reduced ? 0 : 0.24 }}>
          {[{ icon: FileVideo2, title: design.guideUpload, text: design.guideUploadText }, { icon: ScanLine, title: design.guideAnalyze, text: design.guideAnalyzeText }, { icon: ShieldCheck, title: design.guideReview, text: design.guideReviewText }].map(({ icon: Icon, title, text }, index) => <div key={title}><span className={styles.guideNumber}>0{index + 1}</span><Icon size={18} /><h3>{title}</h3><p>{text}</p></div>)}
        </motion.div>}
      </main>
      <Footer />
    </div>
  );
}
