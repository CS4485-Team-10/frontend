"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { apiFetch } from "@/lib/api"
import type { ClaimListResponse, ClaimItem, ClaimFilterOptions } from "@/lib/types/claim"

const PAGE_SIZE_OPTIONS = [10, 15, 20, 50] as const
type PageSize = (typeof PAGE_SIZE_OPTIONS)[number]

type StatKind = "total" | "verified" | "disputed" | "review"

function StatIcon({ kind }: { kind: StatKind }) {
  const cls = "size-5 text-white"
  switch (kind) {
    case "total":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={cls} aria-hidden>
          <path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h10v2H4v-2z" />
        </svg>
      )
    case "verified":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={cls} aria-hidden>
          <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
        </svg>
      )
    case "disputed":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={cls} aria-hidden>
          <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
        </svg>
      )
    case "review":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={cls} aria-hidden>
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
        </svg>
      )
  }
}

function statusBadgeClasses(status: string) {
  const s = status.trim().toLowerCase()
  if (s === "verified" || s === "verified_true")
    return "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-200 dark:ring-emerald-800/60"
  if (s === "disputed")
    return "bg-red-50 text-red-800 ring-1 ring-red-100 dark:bg-red-950/40 dark:text-red-200 dark:ring-red-800/60"
  if (s === "under review")
    return "bg-amber-50 text-amber-800 ring-1 ring-amber-100 dark:bg-amber-950/40 dark:text-amber-200 dark:ring-amber-800/60"
  if (s === "unverifiable")
    return "bg-zinc-100 text-zinc-700 ring-1 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-600"
  return "bg-amber-50 text-amber-800 ring-1 ring-amber-100 dark:bg-amber-950/40 dark:text-amber-200 dark:ring-amber-800/60"
}

function normalizeClaimStatus(status: string) {
  return status.trim().toLowerCase()
}

function mergeUniqueSorted(apiList: string[] | undefined, derived: string[]): string[] {
  const set = new Set<string>()
  for (const x of apiList ?? []) {
    if (x != null && String(x).trim() !== "") set.add(String(x))
  }
  for (const x of derived) {
    if (x != null && String(x).trim() !== "") set.add(String(x))
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b))
}

export default function ClaimValidationPage() {
  const [claims, setClaims] = useState<ClaimItem[]>([])
  const [apiStats, setApiStats] = useState<{ total: number; verified: number; disputed: number; under_review: number } | undefined>(undefined)
  const [filterMeta, setFilterMeta] = useState<ClaimFilterOptions | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<PageSize>(10)

  const [filterOpen, setFilterOpen] = useState(false)
  /** Applied filters (drive the table). Only updated when the user clicks Done. */
  const [statusFilter, setStatusFilter] = useState("")
  const [confidenceFilter, setConfidenceFilter] = useState("")
  /** Draft values while the filter panel is open; discarded if the panel closes without Done. */
  const [filterDraftStatus, setFilterDraftStatus] = useState("")
  const [filterDraftConfidence, setFilterDraftConfidence] = useState("")
  const filterWrapRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const PAGE_LIMIT = 200
    async function fetchAllClaims() {
      const first = await apiFetch<ClaimListResponse>(`/claims?limit=${PAGE_LIMIT}&skip=0`)
      const total = first.count
      let all = first.data

      if (total > PAGE_LIMIT) {
        const remaining = Math.ceil((total - PAGE_LIMIT) / PAGE_LIMIT)
        const pages = await Promise.all(
          Array.from({ length: remaining }, (_, i) =>
            apiFetch<ClaimListResponse>(`/claims?limit=${PAGE_LIMIT}&skip=${(i + 1) * PAGE_LIMIT}`)
          )
        )
        for (const page of pages) all = all.concat(page.data)
      }

      setClaims(all)
      setApiStats(first.stats)
      setFilterMeta(first.filter_options)
      setError(null)
    }

    fetchAllClaims()
      .catch((err) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoading(false))
  }, [])

  const statusOptions = useMemo(
    () =>
      mergeUniqueSorted(
        filterMeta?.statuses,
        claims.map((c) => c.status),
      ),
    [claims, filterMeta],
  )

  const confidenceOptions = useMemo(
    () =>
      mergeUniqueSorted(
        filterMeta?.confidences,
        claims.map((c) => String(c.confidence)),
      ),
    [claims, filterMeta],
  )

  const summaryStats = useMemo(() => {
    if (apiStats) {
      return {
        total: apiStats.total,
        verified: apiStats.verified,
        under_review: apiStats.under_review,
      }
    }
    // Fallback: derive from loaded claims if API stats not yet available
    let verified = 0
    let underReview = 0
    for (const claim of claims) {
      const status = normalizeClaimStatus(claim.status)
      if (status === "verified" || status === "verified_true") {
        verified += 1
      } else {
        underReview += 1
      }
    }
    return { total: claims.length, verified, under_review: underReview }
  }, [apiStats, claims])

  const hasActiveFilters = Boolean(statusFilter || confidenceFilter)

  const visibleClaims = useMemo(() => {
    let out = claims
    if (statusFilter) out = out.filter((c) => c.status === statusFilter)
    if (confidenceFilter) out = out.filter((c) => String(c.confidence) === confidenceFilter)
    const term = search.trim().toLowerCase()
    if (!term) return out
    return out.filter((c) => {
      const haystack = `${c.text} ${c.source} ${c.claim_id}`.toLowerCase()
      return haystack.includes(term)
    })
  }, [claims, search, statusFilter, confidenceFilter])

  const totalPages = Math.max(1, Math.ceil(visibleClaims.length / pageSize))
  const safePage = Math.min(page, totalPages)

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (filterWrapRef.current && e.target instanceof Node && !filterWrapRef.current.contains(e.target)) {
        setFilterOpen(false)
      }
    }
    if (filterOpen) {
      document.addEventListener("pointerdown", onPointerDown)
      return () => document.removeEventListener("pointerdown", onPointerDown)
    }
  }, [filterOpen])

  const pageClaims = useMemo(() => {
    const p = Math.min(page, totalPages)
    const start = (p - 1) * pageSize
    return visibleClaims.slice(start, start + pageSize)
  }, [visibleClaims, page, totalPages, pageSize])

  const rangeStart = visibleClaims.length === 0 ? 0 : (Math.min(page, totalPages) - 1) * pageSize + 1
  const rangeEnd =
    visibleClaims.length === 0 ? 0 : Math.min(visibleClaims.length, (Math.min(page, totalPages) - 1) * pageSize + pageClaims.length)

  function applyFiltersAndClose() {
    setStatusFilter(filterDraftStatus)
    setConfidenceFilter(filterDraftConfidence)
    setPage(1)
    setFilterOpen(false)
  }

  function clearDraftFilters() {
    setFilterDraftStatus("")
    setFilterDraftConfidence("")
  }

  const draftHasSelection = Boolean(filterDraftStatus || filterDraftConfidence)

  if (error) {
    return (
      <div className="mx-auto w-full max-w-6xl p-8">
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 dark:border-red-900/50 dark:bg-red-950/30">
          <p className="text-sm font-medium text-red-600 dark:text-red-400">Failed to load claims: {error}</p>
          <p className="mt-1 text-xs text-red-500 dark:text-red-400/80">Check that the backend API is running.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 p-8">
      <header className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Claim Validation</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Review and verify claims with AI-powered confidence scoring
          </p>
        </div>

        <div className="relative w-full max-w-md shrink-0">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-zinc-400 dark:text-zinc-500">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="size-4" aria-hidden>
              <circle cx="11" cy="11" r="6" />
              <path d="m16 16 3.5 3.5" />
            </svg>
          </span>
          <input
            type="search"
            placeholder="Search claims or sources..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="h-10 w-full rounded-lg border border-zinc-200 bg-white pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-zinc-400 dark:focus:ring-zinc-400/20"
          />
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard kind="total" title="Total claims" value={summaryStats.total} subtitle="In current dataset" />
        <StatCard kind="verified" title="Verified" value={summaryStats.verified} subtitle="High confidence" />
        <StatCard kind="review" title="Under review" value={summaryStats.under_review} subtitle="Pending validation" />
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white shadow-[0_1px_0_rgba(0,0,0,0.04)] dark:border-zinc-700 dark:bg-zinc-800 dark:shadow-none">
        <div className="flex flex-col gap-4 border-b border-zinc-100 px-6 py-5 dark:border-zinc-700 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Claims database</h2>
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">Sortable list with confidence and review status</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative" ref={filterWrapRef}>
              <button
                type="button"
                aria-expanded={filterOpen}
                aria-haspopup="dialog"
                onClick={() => {
                  if (!filterOpen) {
                    setFilterDraftStatus(statusFilter)
                    setFilterDraftConfidence(confidenceFilter)
                  }
                  setFilterOpen((o) => !o)
                }}
                className={`inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-xs font-medium transition-colors dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 ${
                  hasActiveFilters
                    ? "border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-800 dark:border-zinc-200 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-white"
                    : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                }`}
              >
                Filter
                {hasActiveFilters && (
                  <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-bold tabular-nums dark:bg-zinc-900/20">
                    {[statusFilter, confidenceFilter].filter(Boolean).length}
                  </span>
                )}
              </button>

              {filterOpen && (
                <div
                  className="absolute right-0 z-50 mt-2 w-72 max-w-[min(18rem,calc(100vw-2rem))] rounded-xl border border-zinc-200 bg-white p-4 shadow-xl dark:border-zinc-600 dark:bg-zinc-900"
                  role="dialog"
                  aria-label="Filter claims"
                >
                  <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Filter by</p>

                  <div className="mt-3 space-y-3">
                    <label className="block">
                      <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Status</span>
                      <select
                        value={filterDraftStatus}
                        onChange={(e) => setFilterDraftStatus(e.target.value)}
                        className="w-full cursor-pointer rounded-lg border border-zinc-200 bg-white px-2.5 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-400 dark:focus:ring-zinc-400/20"
                      >
                        <option value="">All statuses</option>
                        {statusOptions.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Confidence</span>
                      <select
                        value={filterDraftConfidence}
                        onChange={(e) => setFilterDraftConfidence(e.target.value)}
                        className="w-full cursor-pointer rounded-lg border border-zinc-200 bg-white px-2.5 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-400 dark:focus:ring-zinc-400/20"
                      >
                        <option value="">All confidence values</option>
                        {confidenceOptions.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="mt-4 flex gap-2 border-t border-zinc-100 pt-3 dark:border-zinc-700">
                    <button
                      type="button"
                      onClick={clearDraftFilters}
                      disabled={!draftHasSelection}
                      className="flex-1 rounded-lg border border-zinc-200 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={applyFiltersAndClose}
                      className="flex-1 rounded-lg bg-zinc-900 py-2 text-xs font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Export CSV button removed from here */}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 size-8 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-600 dark:border-zinc-600 dark:border-t-zinc-300" />
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading claims…</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 bg-zinc-50/80 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-400">
                    <th className="whitespace-nowrap px-6 py-3.5">Claim ID</th>
                    <th className="px-6 py-3.5">Claim text</th>
                    <th className="whitespace-nowrap px-6 py-3.5">Source</th>
                    <th className="whitespace-nowrap px-6 py-3.5 text-center">Status</th>
                    <th className="whitespace-nowrap px-6 py-3.5">Confidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-700/50">
                  {pageClaims.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-14 text-center text-sm text-zinc-500 dark:text-zinc-400">
                        No claims match your search or filters.
                      </td>
                    </tr>
                  ) : (
                    pageClaims.map((claim) => (
                      <tr key={claim.claim_id} className="transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-700/35">
                        <td className="whitespace-nowrap px-6 py-4 font-mono text-xs text-zinc-400 dark:text-zinc-500">{claim.claim_id}</td>
                        <td className="max-w-md px-6 py-4 text-zinc-800 dark:text-zinc-200">
                          <span className="font-medium leading-relaxed">{claim.text}</span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-zinc-500 dark:text-zinc-400">{claim.source}</td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${statusBadgeClasses(claim.status)}`}
                          >
                            {claim.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex max-w-[140px] items-center gap-3">
                            <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-600">
                              <div
                                className="h-full rounded-full bg-zinc-800 dark:bg-zinc-300"
                                style={{ width: claim.confidence }}
                              />
                            </div>
                            <span className="shrink-0 tabular-nums text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                              {claim.confidence}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {visibleClaims.length > 0 && (
              <div className="flex flex-col gap-4 border-t border-zinc-100 bg-zinc-50/50 px-5 py-4 dark:border-zinc-700 dark:bg-zinc-900/30 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Showing <span className="font-semibold text-zinc-800 dark:text-zinc-200">{rangeStart}</span>
                  {"–"}
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">{rangeEnd}</span>
                  {" of "}
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">{visibleClaims.length}</span>
                  {(search.trim() || hasActiveFilters) && " matching"} claims
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    <span className="whitespace-nowrap">Rows per page</span>
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        const next = Number(e.target.value) as PageSize
                        setPageSize(next)
                        setPage(1)
                      }}
                      className="cursor-pointer rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-800 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-400 dark:focus:ring-zinc-400/20"
                    >
                      {PAGE_SIZE_OPTIONS.map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white p-0.5 dark:border-zinc-600 dark:bg-zinc-800">
                    <button
                      type="button"
                      disabled={safePage <= 1}
                      onClick={() =>
                        setPage((p) => {
                          const current = Math.min(Math.max(1, p), totalPages)
                          return Math.max(1, current - 1)
                        })
                      }
                      className="rounded-md px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-zinc-400 dark:hover:bg-zinc-700"
                    >
                      Previous
                    </button>
                    <span className="border-l border-r border-zinc-100 px-3 py-1 text-xs tabular-nums text-zinc-600 dark:border-zinc-600 dark:text-zinc-400">
                      Page <span className="font-semibold text-zinc-900 dark:text-zinc-100">{safePage}</span> / {totalPages}
                    </span>
                    <button
                      type="button"
                      disabled={safePage >= totalPages}
                      onClick={() =>
                        setPage((p) => {
                          const current = Math.min(Math.max(1, p), totalPages)
                          return Math.min(totalPages, current + 1)
                        })
                      }
                      className="rounded-md px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-zinc-400 dark:hover:bg-zinc-700"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}

function StatCard({
  kind,
  title,
  value,
  subtitle,
}: {
  kind: StatKind
  title: string
  value: number
  subtitle: string
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-[0_1px_0_rgba(0,0,0,0.04)] dark:border-zinc-700 dark:bg-zinc-800 dark:shadow-none">
      <div className="flex gap-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-zinc-900 dark:bg-zinc-700">
          <StatIcon kind={kind} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{title}</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight text-zinc-900 tabular-nums dark:text-zinc-100">{value}</p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{subtitle}</p>
        </div>
      </div>
    </div>
  )
}