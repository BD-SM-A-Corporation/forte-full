"use client";

import { useId, useState } from "react";
import { ArrowUpTrayIcon } from "@heroicons/react/24/outline";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FileVideo2, ArrowUpRight } from "lucide-react";
import styles from "./DropZone.module.css";

interface DropZoneProps {
  onFile: (file: File) => void;
  disabled?: boolean;
  lang?: "ru" | "kz" | "en";
}

const ACCEPT = ".mov,video/quicktime";

function isSupportedVideo(file: File) {
  return /\.mov$/i.test(file.name);
}

export default function DropZone({ onFile, disabled, lang = "ru" }: DropZoneProps) {
  const reduced = useReducedMotion();
  const [dragOver, setDragOver] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const [error, setError] = useState<"multiple" | "unsupported" | "size" | null>(null);
  const descriptionId = useId();
  const errorId = useId();
  const isDragging = dragOver && !disabled;

  const t = {
    ru: {
      dragTitle: "Всё начинается с видео",
      drop: "Отпустите, чтобы добавить",
      formatLabel: "Видеозапись",
      orBrowse: "Перетащите запись сюда или выберите файл на компьютере",
      formats: "MOV · до 512 МБ",
      buttonText: "Выбрать видеофайл",
      size: "Выберите непустой файл размером до 512 МБ.",
      multiple: "Выберите один видеофайл. Несколько файлов одновременно не поддерживаются.",
      unsupported: "Выберите видео в формате MOV.",
    },
    kz: {
      dragTitle: "Барлығы бейнеден басталады",
      drop: "Қосу үшін жіберіңіз",
      formatLabel: "Бейнежазба",
      orBrowse: "немесе компьютерден файлды таңдаңыз",
      formats: "MOV · 512 МБ дейін",
      buttonText: "Бейнефайлды таңдау",
      size: "512 МБ дейінгі бос емес файлды таңдаңыз.",
      multiple: "Бір бейнефайлды таңдаңыз. Бірнеше файлды қатар жүктеуге болмайды.",
      unsupported: "MOV форматындағы бейнені таңдаңыз.",
    },
    en: {
      dragTitle: "It starts with a recording",
      drop: "Release to add your video",
      formatLabel: "Video recording",
      orBrowse: "Drop your recording here or choose a file from your computer",
      formats: "MOV · up to 512 MB",
      buttonText: "Choose video file",
      size: "Choose a non-empty file up to 512 MB.",
      multiple: "Choose one video file. Multiple files cannot be selected at the same time.",
      unsupported: "Choose a video in MOV format.",
    },
  }[lang];

  const selectFiles = (files: FileList | null) => {
    if (disabled || !files?.length) return;
    if (files.length !== 1) {
      setError("multiple");
      return;
    }
    const file = files[0];
    if (!isSupportedVideo(file)) {
      setError("unsupported");
      return;
    }
    if (!file.size || file.size > 512 * 1024 * 1024) {
      setError("size");
      return;
    }
    setError(null);
    onFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;
    selectFiles(e.dataTransfer.files);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    selectFiles(e.target.files);
    e.target.value = "";
  };

  return (
    <motion.label
      className={styles.dropzone}
      data-dragging={isDragging}
      data-focused={focusWithin}
      aria-disabled={disabled || undefined}
      animate={{ borderColor: isDragging ? "#0e85e6" : "#dbe5ef", backgroundColor: isDragging ? "#edf7ff" : "#ffffff" }}
      onFocus={() => setFocusWithin(true)}
      onBlur={() => setFocusWithin(false)}
      onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragOver(true); }}
      onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDragOver(false); }}
      onDrop={handleDrop}
    >
      <input type="file" accept={ACCEPT} className="sr-only" aria-label={t.buttonText} aria-describedby={error ? `${descriptionId} ${errorId}` : descriptionId} aria-invalid={error ? true : undefined} onChange={handleChange} disabled={disabled} />
      <span className={styles.cornerLabel}><span />{t.formatLabel}</span>
      <span className={styles.cornerArrow}><ArrowUpRight size={17} /></span>
      <div className={styles.artwork} aria-hidden="true">
        <div className={styles.grid} />
        <motion.div className={`${styles.fileCard} ${styles.backCard}`} animate={{ rotate: reduced ? -9 : isDragging ? -16 : -9, x: isDragging && !reduced ? -8 : 0 }} />
        <motion.div className={styles.fileCard} animate={{ y: isDragging && !reduced ? -10 : 0, rotate: isDragging && !reduced ? 4 : 0 }} transition={{ type: "spring", stiffness: 260, damping: 20 }}>
          <FileVideo2 size={34} strokeWidth={1.3} />
          <span>MOV</span>
          <div className={styles.cardLines}><i /><i /></div>
        </motion.div>
        <motion.span className={styles.uploadBubble} animate={{ scale: isDragging && !reduced ? 1.12 : 1, y: isDragging && !reduced ? -4 : 0 }}><ArrowUpTrayIcon width={17} height={17} /></motion.span>
      </div>
      <h3>{isDragging ? t.drop : t.dragTitle}</h3>
      <p>{t.orBrowse}</p>
      <span className={styles.chooseButton}>{t.buttonText}<ArrowUpRight size={15} /></span>
      <span id={descriptionId} className={styles.formats}>{t.formats}</span>
      <AnimatePresence initial={false}>
        {error && <motion.p key={error} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} id={errorId} role="alert" className={styles.error}>{t[error]}</motion.p>}
      </AnimatePresence>
    </motion.label>
  );
}
