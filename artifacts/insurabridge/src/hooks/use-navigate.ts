import { useLocation } from "wouter"
import { useNavLoading } from "@/lib/nav-context"
import { useCallback } from "react"

/**
 * Drop-in replacement for wouter's setLocation that shows the page-
 * transition loader before navigating and hides it after mount.
 */
export function useAppNavigate() {
  const [, rawSetLocation] = useLocation()
  const { setLoading } = useNavLoading()

  return useCallback(
    (to: string) => {
      setLoading(true)
      setTimeout(() => {
        rawSetLocation(to)
        setTimeout(() => setLoading(false), 280)
      }, 420)
    },
    [rawSetLocation, setLoading],
  )
}
