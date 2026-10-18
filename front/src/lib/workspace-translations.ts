import type { Language } from "./translations";

interface WorkspaceTranslations {
  subtitle: string;
  uploadTitle: string;
  analysisTitle: string;
  singleVideo: string;
  replaceVideo: string;
  waiting: string;
  videoSelected: string;
  failed: string;
  emptyTitle: string;
  emptyDescription: string;
  unavailableTitle: string;
  unavailableDescription: string;
  failedTitle: string;
  failedDescription: string;
}

export const workspaceTranslations: Record<Language, WorkspaceTranslations> = {
  ru: {
    subtitle: "Видео кассовой операции и результаты проверки на одном экране.",
    uploadTitle: "Загрузка видео",
    analysisTitle: "Анализ",
    singleVideo: "Один файл за раз",
    replaceVideo: "Заменить видео",
    waiting: "Ожидание видео",
    videoSelected: "Видео выбрано",
    failed: "Ошибка анализа",
    emptyTitle: "Видео ещё не выбрано",
    emptyDescription: "Выберите MOV-файл слева, затем запустите анализ.",
    unavailableTitle: "Анализ пока недоступен",
    unavailableDescription: "Вы можете просмотреть запись слева. Результаты проверки будут доступны после подключения сервиса анализа.",
    failedTitle: "Не удалось завершить анализ",
    failedDescription: "Попробуйте выбрать файл ещё раз.",
  },
  kz: {
    subtitle: "Кассалық операция бейнесі мен тексеру нәтижелері бір экранда.",
    uploadTitle: "Бейнені жүктеу",
    analysisTitle: "Талдау",
    singleVideo: "Бір уақытта бір файл",
    replaceVideo: "Бейнені ауыстыру",
    waiting: "Бейне күтілуде",
    videoSelected: "Бейне таңдалды",
    failed: "Талдау қатесі",
    emptyTitle: "Бейне әлі таңдалмаған",
    emptyDescription: "Сол жақтан MOV файлын таңдап, талдауды бастаңыз.",
    unavailableTitle: "Талдау әзірге қолжетімсіз",
    unavailableDescription: "Жазбаны сол жақтан көре аласыз. Тексеру нәтижелері талдау қызметі қосылғаннан кейін қолжетімді болады.",
    failedTitle: "Талдауды аяқтау мүмкін болмады",
    failedDescription: "Файлды қайта таңдап көріңіз.",
  },
  en: {
    subtitle: "Cash operation video and review results in one workspace.",
    uploadTitle: "Video upload",
    analysisTitle: "Analysis",
    singleVideo: "One file at a time",
    replaceVideo: "Replace video",
    waiting: "Waiting for video",
    videoSelected: "Video selected",
    failed: "Analysis error",
    emptyTitle: "No video selected",
    emptyDescription: "Choose a MOV file on the left, then start the analysis.",
    unavailableTitle: "Analysis is currently unavailable",
    unavailableDescription: "You can watch the recording on the left. Review results will be available once the analysis service is connected.",
    failedTitle: "Could not complete analysis",
    failedDescription: "Try choosing the file again.",
  },
};
