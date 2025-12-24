import commonEn from "@/locales/en/common.json";
import commonZhCN from "@/locales/zh-CN/common.json";
import loginEn from "@/locales/en/Login.json";
import loginZhCN from "@/locales/zh-CN/Login.json";
import notfoundEn from "@/locales/en/notfound.json";
import notfoundZhCN from "@/locales/zh-CN/notfound.json";
import { initReactI18next } from "react-i18next";
import i18next from "i18next";

i18next.use(initReactI18next).init({
  resources: {
    en: { common: commonEn, login: loginEn, notfound: notfoundEn },
    "zh-CN": { common: commonZhCN, login: loginZhCN, notfound: notfoundZhCN },
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});
