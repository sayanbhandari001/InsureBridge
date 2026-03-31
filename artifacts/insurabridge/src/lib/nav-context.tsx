import { createContext, useContext, useState, useCallback, ReactNode } from "react"

interface NavCtx {
  loading: boolean
  setLoading: (v: boolean) => void
}

const NavContext = createContext<NavCtx>({ loading: false, setLoading: () => {} })

export function NavProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(false)
  return <NavContext.Provider value={{ loading, setLoading }}>{children}</NavContext.Provider>
}

export function useNavLoading() {
  return useContext(NavContext)
}
