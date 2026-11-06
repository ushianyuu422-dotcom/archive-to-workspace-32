import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "fil";

const DICT: Record<string, { en: string; fil: string }> = {
  // nav
  "nav.home": { en: "Home", fil: "Home" },
  "nav.services": { en: "Services", fil: "Mga Serbisyo" },
  "nav.pwd": { en: "PWD", fil: "PWD" },
  "nav.court": { en: "Court Booking", fil: "Reserba ng Korte" },
  "nav.announcements": { en: "Announcements", fil: "Mga Anunsyo" },
  "nav.officials": { en: "Officials", fil: "Mga Opisyal" },
  "nav.contact": { en: "Contact", fil: "Ugnayan" },
  "nav.signIn": { en: "Log in / Sign up", fil: "Mag-login / Mag-sign up" },
  "nav.myAccount": { en: "My Account", fil: "Aking Account" },
  "nav.signOut": { en: "Sign out", fil: "Mag-sign out" },
  "nav.hotlines": { en: "Emergency Hotlines", fil: "Emergency Hotlines" },
  // hero
  "hero.kicker": { en: "Barangay Wawa, Taguig City", fil: "Barangay Wawa, Lungsod Taguig" },
  "hero.title": { en: "Serving our neighbors, online and in person.", fil: "Naglilingkod sa mga kapitbahay, online at personal." },
  "hero.body": {
    en: "Barangay Wawa United is one platform for everything our community needs: barangay services, the PWD portal, and the barangay court.",
    fil: "Ang Barangay Wawa United ay isang platform para sa lahat ng kailangan ng pamayanan: mga serbisyo ng barangay, ang PWD portal, at ang barangay court.",
  },
  "hero.book": { en: "Book the Court", fil: "Mag-reserba ng Korte" },
  "hero.pwd": { en: "PWD Services", fil: "Serbisyo para sa PWD" },
  // common
  "common.todayAtCourt": { en: "Today at the court", fil: "Ngayon sa korte" },
  "common.viewAll": { en: "View all", fil: "Tingnan lahat" },
  "common.readMore": { en: "Read more", fil: "Basahin" },
  "common.where": { en: "Where", fil: "Saan" },
  "common.who": { en: "Who", fil: "Sino" },
  "common.when": { en: "When", fil: "Kailan" },
  "common.loading": { en: "Loading…", fil: "Naglo-load…" },
  "common.send": { en: "Send", fil: "Ipadala" },
  "common.submit": { en: "Submit", fil: "Ipasa" },
  "common.cancel": { en: "Cancel", fil: "Kanselahin" },
  "common.save": { en: "Save", fil: "I-save" },
  "common.back": { en: "Back", fil: "Bumalik" },
  "common.close": { en: "Close", fil: "Isara" },
  "common.consent": {
    en: "I consent to the collection and processing of my personal data under the Data Privacy Act (RA 10173).",
    fil: "Sumasang-ayon ako sa pagkolekta at pagproseso ng aking personal na impormasyon alinsunod sa Data Privacy Act (RA 10173).",
  },
  // landing sections
  "home.featuredTitle": { en: "Featured announcement", fil: "Itinatampok na anunsyo" },
  "home.servicesTitle": { en: "What do you need today?", fil: "Ano ang kailangan mo ngayon?" },
  "home.servicesBody": { en: "Tap a service. We will guide you one step at a time.", fil: "Pindutin ang serbisyo. Gagabayan ka namin hakbang-hakbang." },
  "home.officialsTitle": { en: "The people serving Wawa", fil: "Ang mga taong naglilingkod sa Wawa" },
  "home.mapTitle": { en: "Find us", fil: "Hanapin kami" },
  "home.faqTitle": { en: "Frequently asked questions", fil: "Mga madalas itanong" },
  // booking
  "court.pick": { en: "Pick a slot", fil: "Pumili ng oras" },
  "court.available": { en: "Available", fil: "Bakante" },
  "court.pending": { en: "Pending", fil: "Naghihintay" },
  "court.booked": { en: "Booked", fil: "Naka-reserba" },
  "court.blocked": { en: "Blocked", fil: "Sarado" },
  "court.yours": { en: "Yours", fil: "Sa'yo" },
  // PWD
  "pwd.title": { en: "PWD Portal", fil: "PWD Portal" },
  "pwd.guides": { en: "Step-by-step guides", fil: "Mga gabay hakbang-hakbang" },
  "pwd.benefits": { en: "Services and benefits", fil: "Mga serbisyo at benepisyo" },
  "pwd.help": { en: "Need help?", fil: "Kailangan ng tulong?" },
};

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: keyof typeof DICT | string, fallback?: string) => string;
}

const LanguageContext = createContext<LangCtx>({
  lang: "en",
  setLang: () => {},
  t: (_k, fb) => fb ?? String(_k),
});

const STORAGE_KEY = "bwu-lang";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "en" || saved === "fil") setLangState(saved);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    window.localStorage.setItem(STORAGE_KEY, l);
  };

  const t = (key: string, fallback?: string) => {
    const entry = DICT[key];
    if (!entry) return fallback ?? key;
    return entry[lang];
  };

  return <LanguageContext.Provider value={{ lang, setLang, t }}>{children}</LanguageContext.Provider>;
}

export function useLang() {
  return useContext(LanguageContext);
}
