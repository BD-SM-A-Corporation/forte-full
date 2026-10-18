"use client";

import { useSyncExternalStore } from "react";
import type { Language } from "./translations";

let fallbackLanguage: Language = "ru";
const EVENT = "forte-language-change";

function getLanguage(): Language {
  try {
    const value = localStorage.getItem("forte-language");
    return value === "ru" || value === "kz" || value === "en" ? value : fallbackLanguage;
  } catch {
    return fallbackLanguage;
  }
}

function subscribe(listener: () => void) {
  window.addEventListener(EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}

function setLanguage(language: Language) {
  fallbackLanguage = language;
  try { localStorage.setItem("forte-language", language); } catch { /* Keep the session preference. */ }
  document.documentElement.lang = language === "kz" ? "kk" : language;
  window.dispatchEvent(new Event(EVENT));
}

export function useLanguage() {
  const language = useSyncExternalStore(subscribe, getLanguage, () => "ru" as Language);
  return [language, setLanguage] as const;
}
