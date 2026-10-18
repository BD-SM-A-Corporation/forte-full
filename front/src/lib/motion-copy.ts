import type { Language } from "./translations";

export const motionCopy = {
  ru: {
    workspace: "Рабочее пространство", local: "Локальная обработка", human: "Решение остаётся за специалистом",
    workflow: "Этапы проверки", upload: "Загрузите запись", analyze: "Запустите анализ", review: "Проверьте события",
    assistant: "Ассистент проверки", emptyTitle: "От записи — к ясной картине",
    videoNote: "Видео отправляется на анализ только после вашего запуска.",
    events: "События", observations: "Наблюдения", duration: "Длительность",
    guideUpload: "Добавьте видео", guideUploadText: "Одна запись кассовой операции в формате MOV, до 512 МБ.",
    guideAnalyze: "Изучите детали", guideAnalyzeText: "Наблюдения модели, таймкоды и опорные кадры в одном месте.",
    guideReview: "Примите решение", guideReviewText: "Сопоставьте события с правилами и сохраните результат проверки.",
  },
  kz: {
    workspace: "Жұмыс кеңістігі", local: "Жергілікті өңдеу", human: "Шешімді маман қабылдайды",
    workflow: "Тексеру кезеңдері", upload: "Бейнені жүктеңіз", analyze: "Талдауды бастаңыз", review: "Оқиғаларды тексеріңіз",
    assistant: "Тексеру көмекшісі", emptyTitle: "Бейнеден — айқын көрініске",
    videoNote: "Бейне талдауды бастағаннан кейін ғана жіберіледі.",
    events: "Оқиғалар", observations: "Бақылаулар", duration: "Ұзақтығы",
    guideUpload: "Бейне қосыңыз", guideUploadText: "MOV форматындағы бір кассалық операция жазбасы, 512 МБ дейін.",
    guideAnalyze: "Мәліметтерді қараңыз", guideAnalyzeText: "Модель бақылаулары, таймкодтар және тірек кадрлар бір жерде.",
    guideReview: "Шешім қабылдаңыз", guideReviewText: "Оқиғаларды ережелермен салыстырып, тексеру нәтижесін сақтаңыз.",
  },
  en: {
    workspace: "Workspace", local: "Local processing", human: "The final decision stays with you",
    workflow: "Review steps", upload: "Upload recording", analyze: "Start analysis", review: "Review events",
    assistant: "Review assistant", emptyTitle: "From recording to clarity",
    videoNote: "Your video is sent for analysis only when you start it.",
    events: "Events", observations: "Observations", duration: "Duration",
    guideUpload: "Add a recording", guideUploadText: "One cash operation recording in MOV format, up to 512 MB.",
    guideAnalyze: "Explore the details", guideAnalyzeText: "Model observations, timestamps and evidence frames in one place.",
    guideReview: "Make your assessment", guideReviewText: "Compare events against the rules and export the review result.",
  },
} satisfies Record<Language, Record<string, string>>;
