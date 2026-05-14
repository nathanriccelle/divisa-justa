import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import de from "./de-DE.json";
import en from "./en-US.json";
import es from "./es-ES.json";
import fr from "./fr-FR.json";
import pt from "./pt-BR.json";

const resources = {
  "pt-BR": { translation: pt },
  "en-US": { translation: en },
  "es-ES": { translation: es },
  "fr-FR": { translation: fr },
  "de-DE": { translation: de },
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
