import { createContext, useContext, useState } from "react"
import type { ReactNode } from "react"

export interface LocaleOption {
  code: string
  label: string
  shortLabel: string
  dateLocale: string
}

export const LOCALES: LocaleOption[] = [
  { code: "en-US", label: "English (US)",  shortLabel: "EN-US", dateLocale: "en-US" },
  { code: "en-GB", label: "English (UK)",  shortLabel: "EN-UK", dateLocale: "en-GB" },
  { code: "hi-IN", label: "हिन्दी",         shortLabel: "HI",    dateLocale: "hi-IN" },
  { code: "ko-KR", label: "한국어",          shortLabel: "KO",    dateLocale: "ko-KR" },
]

interface LocaleContextValue {
  locale: LocaleOption
  setLocale: (l: LocaleOption) => void
  formatDate: (dateString: string) => string
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: LOCALES[0],
  setLocale: () => {},
  formatDate: (d) => d,
})

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleOption>(() => {
    try {
      const stored = localStorage.getItem("ib-locale")
      return LOCALES.find(l => l.code === stored) ?? LOCALES[0]
    } catch {
      return LOCALES[0]
    }
  })

  const setLocale = (l: LocaleOption) => {
    setLocaleState(l)
    try { localStorage.setItem("ib-locale", l.code) } catch {}
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return new Intl.DateTimeFormat(locale.dateLocale, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date)
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale, formatDate }}>
      {children}
    </LocaleContext.Provider>
  )
}

export const useLocale = () => useContext(LocaleContext)
