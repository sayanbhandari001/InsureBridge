import { createContext, useContext, useEffect, useState } from "react"
import type { ReactNode } from "react"

type Theme = "dark" | "light"

interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  toggleTheme: () => {},
})

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const stored = localStorage.getItem("ib-theme") as Theme | null
      return stored === "light" ? "light" : "dark"
    } catch {
      return "dark"
    }
  })

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove("dark", "light")
    root.classList.add(theme)
    root.style.colorScheme = theme
    try { localStorage.setItem("ib-theme", theme) } catch {}
  }, [theme])

  const toggleTheme = () => {
    const root = document.documentElement
    root.setAttribute("data-theme-transitioning", "")
    setTimeout(() => root.removeAttribute("data-theme-transitioning"), 1550)
    setTheme(t => t === "dark" ? "light" : "dark")
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
