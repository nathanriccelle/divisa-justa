import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./en-US.json";
import pt from "./pt-BR.json";

const resources = {
  "pt-BR": { translation: pt },
  "en-US": { translation: en },
};

i18n.use(initReactI18next).init({
  resources,
  lng: Localization.getLocales()[0].languageTag, // Pega o idioma do celular
  fallbackLng: "en-US", // Se o celular estiver em francês, cai pro inglês
  interpolation: {
    escapeValue: false, // React já protege contra XSS
  },
});

export default i18n;
