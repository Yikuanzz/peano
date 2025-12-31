import commonEn from "@/locales/en/common.json";
import commonZhCN from "@/locales/zh-CN/common.json";
import loginEn from "@/locales/en/login.json";
import loginZhCN from "@/locales/zh-CN/login.json";
import notFoundEn from "@/locales/en/notfound.json";
import notFoundZhCN from "@/locales/zh-CN/notfound.json";
import { initReactI18next } from "react-i18next";
import i18next from "i18next";

i18next.use(initReactI18next).init({
  resources: {
    en: { common: commonEn, login: loginEn, notFound: notFoundEn },
    "zh-CN": { common: commonZhCN, login: loginZhCN, notFound: notFoundZhCN },
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});
