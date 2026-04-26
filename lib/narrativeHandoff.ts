import { useRef, useSyncExternalStore } from "react"
import type { AlertItem } from "@/lib/types/alert"
import type { NarrativeItem } from "@/lib/types/narrative"

const PREFIX = "nd-handoff:"

export function stashNarrativeHandoff(n: NarrativeItem): void {
  if (typeof window === "undefined") return
  try {
    sessionStorage.setItem(`${PREFIX}${n.id}`, JSON.stringify(n))
  } catch {
    /* private mode / quota */
  }
}

export function clearNarrativeHandoff(id: string): void {
  if (typeof window === "undefined") return
  try {
    sessionStorage.removeItem(`${PREFIX}${id}`)
  } catch {
    /* ignore */
  }
}

export function readNarrativeHandoff(id: string | null): NarrativeItem | null {
  if (!id || typeof window === "undefined") return null
  try {
    const raw = sessionStorage.getItem(`${PREFIX}${id}`)
    if (!raw) return null
    const parsed = JSON.parse(raw) as NarrativeItem
    return String(parsed.id) === String(id) ? parsed : null
  } catch {
    return null
  }
}

/** Map an alert row to the narrative shape expected by the discovery dialog. */
export function alertItemAsNarrativeHandoff(a: AlertItem): NarrativeItem {
  return {
    id: a.id,
    title: a.title,
    description: a.description,
    detail: a.description,
    category: "Narrative",
    risk_level: a.risk_level,
    risk_score: a.risk_score,
    videos_analyzed: a.videos_analyzed,
    total_views: a.total_views,
    time_window: a.time_window,
    primary_link: null,
  }
}

/**
 * Reads a narrative stashed for deep-link open (?id=) after the first paint so
 * server HTML and the first hydrated client snapshot both stay null, then the
 * next snapshot pulls from sessionStorage (instant dialog after navigation).
 *
 * Parsed objects are cached by storage key + raw string so getSnapshot returns
 * referentially stable values — required by useSyncExternalStore (React 19).
 */
export function useNarrativeHandoff(id: string | null): NarrativeItem | null {
  const pass = useRef(0)
  const snapshotCache = useRef<{
    storageKey: string
    raw: string | null
    parsed: NarrativeItem | null
  } | null>(null)

  return useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === "undefined") return () => {}
      queueMicrotask(() => {
        pass.current += 1
        onStoreChange()
      })
      return () => {}
    },
    () => {
      if (!id || typeof window === "undefined") return null
      if (pass.current === 0) return null

      const storageKey = `${PREFIX}${id}`
      let raw: string | null
      try {
        raw = sessionStorage.getItem(storageKey)
      } catch {
        raw = null
      }

      const c = snapshotCache.current
      if (c && c.storageKey === storageKey && c.raw === raw) {
        return c.parsed
      }

      let parsed: NarrativeItem | null = null
      if (raw) {
        try {
          const obj = JSON.parse(raw) as NarrativeItem
          parsed = String(obj.id) === String(id) ? obj : null
        } catch {
          parsed = null
        }
      }
      snapshotCache.current = { storageKey, raw, parsed }
      return parsed
    },
    () => null,
  )
}
