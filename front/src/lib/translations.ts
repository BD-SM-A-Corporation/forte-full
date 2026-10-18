export type Language = "ru" | "kz" | "en";

export interface Translations {
  brandTagline: string;
  resetAnalysis: string;
}

export const translations: Record<Language, Translations> = {
  ru: {
    brandTagline: "Визуальная проверка кассовых операций",
    resetAnalysis: "Новый анализ",
  },
  kz: {
    brandTagline: "Кассалық операцияларды визуалды тексеру",
    resetAnalysis: "Жаңа талдау",
  },
  en: {
    brandTagline: "Visual review of cash operations",
    resetAnalysis: "New analysis",
  },
};
