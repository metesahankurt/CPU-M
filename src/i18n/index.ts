import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./messages/en.json";
import tr from "./messages/tr.json";

const initialLanguage = (() => {
  try {
    const raw = localStorage.getItem("cpum-settings");
    if (raw) {
      const parsed = JSON.parse(raw);
      const lang = parsed?.state?.language;
      if (lang === "tr" || lang === "en") {
        return lang;
      }
    }
  } catch {
    // fall through to browser detection
  }
  return navigator.language?.toLowerCase().startsWith("tr") ? "tr" : "en";
})();

i18n.use(initReactI18next).init({
  resources: {
    tr: tr as Record<string, Record<string, unknown>>,
    en: en as Record<string, Record<string, unknown>>,
  },
  lng: initialLanguage,
  fallbackLng: "en",
  // Namespaces mirror Catalyzer's message layout: one top-level key per feature.
  ns: Object.keys(en),
  defaultNS: "Common",
  interpolation: { escapeValue: false },
});

export default i18n;
