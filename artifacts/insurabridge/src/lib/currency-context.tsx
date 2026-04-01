import { createContext, useContext, useState } from "react"
import type { ReactNode } from "react"

export interface CurrencyOption {
  code: string
  symbol: string
  label: string
  locale: string
}

export const CURRENCIES: CurrencyOption[] = [
  { code: "INR", symbol: "₹", label: "₹ INR (Indian Rupee)", locale: "en-IN" },
  { code: "USD", symbol: "$", label: "$ USD (US Dollar)",    locale: "en-US" },
  { code: "GBP", symbol: "£", label: "£ GBP (British Pound)", locale: "en-GB" },
  { code: "EUR", symbol: "€", label: "€ EUR (Euro)",         locale: "de-DE" },
  { code: "KRW", symbol: "₩", label: "₩ KRW (Korean Won)",  locale: "ko-KR" },
]

interface CurrencyContextValue {
  currency: CurrencyOption
  setCurrency: (c: CurrencyOption) => void
  formatAmount: (amount: number) => string
}

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: CURRENCIES[0],
  setCurrency: () => {},
  formatAmount: (n) => `₹${n.toFixed(2)}`,
})

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyOption>(() => {
    try {
      const stored = localStorage.getItem("ib-currency")
      return CURRENCIES.find(c => c.code === stored) ?? CURRENCIES[0]
    } catch {
      return CURRENCIES[0]
    }
  })

  const setCurrency = (c: CurrencyOption) => {
    setCurrencyState(c)
    try { localStorage.setItem("ib-currency", c.code) } catch {}
  }

  const formatAmount = (amount: number) =>
    new Intl.NumberFormat(currency.locale, {
      style: "currency",
      currency: currency.code,
      maximumFractionDigits: 2,
    }).format(amount)

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatAmount }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export const useCurrency = () => useContext(CurrencyContext)
