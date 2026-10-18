"use client";

import { useId, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Pause, Play } from "lucide-react";
import type { Language } from "@/lib/translations";
import styles from "./AnalysisVisual.module.css";

// A schematic of the review workflow, never a representation of detected events.
export function AnalysisVisual({ active = false, ready = false, lang = "ru" }: { active?: boolean; ready?: boolean; lang?: Language }) {
  const reduced = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const id = useId();
  const animate = active && !reduced && !paused;
  const t = {
    ru: { video: "Видео", analysis: "Анализ", review: "Проверка", pause: "Приостановить анимацию", play: "Продолжить анимацию", schematic: "Схема обработки" },
    kz: { video: "Бейне", analysis: "Талдау", review: "Тексеру", pause: "Анимацияны кідірту", play: "Анимацияны жалғастыру", schematic: "Өңдеу сызбасы" },
    en: { video: "Video", analysis: "Analysis", review: "Review", pause: "Pause animation", play: "Resume animation", schematic: "Processing diagram" },
  }[lang];

  return (
    <div className={styles.visual} data-active={active}>
      <svg viewBox="0 0 360 180" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#0e85e6" /><stop offset="1" stopColor="#49b9d6" />
          </linearGradient>
        </defs>
        <circle cx="180" cy="86" r="74" stroke="#e5edf4" strokeDasharray="2 7" />
        <circle cx="180" cy="86" r="52" stroke="#e5edf4" />
        <path d="M65 86H142M218 86H295" stroke="#d8e5ef" strokeWidth="2" strokeDasharray="4 5" />
        {[0, 1].map(index => (
          <motion.circle key={index} r="3" cy="86" fill="#0e85e6"
            initial={false} animate={animate ? { cx: [70 + index * 145, 142 + index * 145], opacity: [0, 1, 0] } : { cx: 108 + index * 145, opacity: ready || active ? 0.6 : 0.15 }}
            transition={animate ? { duration: 1.8, repeat: Infinity, delay: index * 0.9, ease: "linear" } : { duration: 0.2 }} />
        ))}
        <rect x="24" y="62" width="52" height="48" rx="14" fill="white" stroke="#dce6ef" />
        <rect x="39" y="76" width="22" height="20" rx="4" stroke="#8094a9" strokeWidth="1.5" />
        <path d="m48 81 7 5-7 5V81Z" fill="#8094a9" />
        <motion.g initial={false} animate={{ scale: ready || active ? 1 : 0.92 }} style={{ transformOrigin: "180px 86px" }}>
          <rect x="142" y="48" width="76" height="76" rx="25" fill={`url(#${id})`} />
          <rect x="161" y="67" width="38" height="38" rx="10" stroke="white" strokeOpacity=".75" strokeWidth="1.5" />
          <path d="M171 81v10m9-16v22m9-16v10" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <motion.rect x="155" width="50" height="2" rx="1" fill="white" initial={false}
            animate={animate ? { y: [65, 106, 65], opacity: [0.2, 0.8, 0.2] } : { y: 85, opacity: 0 }}
            transition={animate ? { duration: 3, repeat: Infinity, ease: "easeInOut" } : { duration: 0 }} />
        </motion.g>
        <rect x="284" y="62" width="52" height="48" rx="14" fill="white" stroke="#dce6ef" />
        <path d="M302 76h12m-12 7h16m-16 7h9m-9 7h13" stroke="#8094a9" strokeWidth="1.5" strokeLinecap="round" />
        {[t.video, t.analysis, t.review].map((label, index) => <text key={index} x={[50, 180, 310][index]} y="155" textAnchor="middle" fill="#708397" fontSize="10" fontFamily="inherit">{label}</text>)}
      </svg>
      {active && <div className={styles.caption}><span>{t.schematic}</span>{!reduced && <button type="button" onClick={() => setPaused(value => !value)} aria-label={paused ? t.play : t.pause} title={paused ? t.play : t.pause}>{paused ? <Play size={13} /> : <Pause size={13} />}</button>}</div>}
    </div>
  );
}
