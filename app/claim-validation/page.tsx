"use client"

import { useEffect, useMemo, useState } from "react"
import { apiFetch } from "@/lib/api"
import type { ClaimListResponse, ClaimItem } from "@/lib/types/claim"

export default function ClaimValidationPage() {
  const [claims, setClaims] = useState<ClaimItem[]>([])
  const [stats, setStats] = useState({ total: 0, verified: 0, disputed: 0, under_review: 0 })
  const [loading, setLoading] = useState(true) 
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  useEffect(() => {
    apiFetch<ClaimListResponse>("/claims")
      .then((response) => {
        setClaims(response.data);
        setStats(response.stats);
        setError(null);
      })
      .catch((err) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoading(false));
  }, [])

  const visibleClaims = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return claims
    return claims.filter((c) => {
      const haystack = `${c.text} ${c.source} ${c.claim_id}`.toLowerCase()
      return haystack.includes(term)
    })
  }, [search, claims])

  const statusStyle = (status: string) => {
    if (status === "Verified")
      return "bg-green-100 text-green-700 border-green-200"
    if (status === "Disputed")
      return "bg-red-100 text-red-700 border-red-200"
    return "bg-yellow-100 text-yellow-700 border-yellow-200"
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
           <p className="text-sm text-red-600 font-medium">Failed to load claims: {error}</p>
           <p className="text-xs text-red-500 mt-1">Check that the backend API is running.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Claim Validation</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            Review and verify claims with AI-powered confidence scoring
          </p>
        </div>

        <input
          placeholder="Search claims or creators..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-zinc-200 rounded-lg px-4 py-2 w-96 focus:ring-2 focus:ring-zinc-900/10 outline-none bg-white text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:ring-zinc-400/20"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card title="Total Claims" value={stats.total} subtitle="scoped videos" />
        <Card title="Verified" value={stats.verified} subtitle="confidence high" />
        <Card title="Disputed" value={stats.disputed} subtitle="potential risk" />
        <Card title="Under Review" value={stats.under_review} subtitle="pending check" />
      </div>

      {/* Claims Table Container */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm dark:bg-zinc-800 dark:border-zinc-700">
        <div className="flex justify-between items-center p-6 border-b border-zinc-100 dark:border-zinc-700">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Claims Database</h2>
          <div className="flex gap-3">
            <button className="text-sm font-medium border border-zinc-200 rounded-lg px-4 py-2 text-zinc-700 hover:bg-zinc-50 transition-colors dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700">Filter</button>
            {/* Export CSV button removed from here */}
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-zinc-900 dark:border-zinc-300 mb-4"></div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Processing Narrative Data...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-zinc-50 text-zinc-500 font-medium border-b border-zinc-100 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700">
                <tr>
                  <th className="p-4">Claim ID</th>
                  <th className="p-4">Claim Text</th>
                  <th className="p-4">Source</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-700/50">
                {visibleClaims.map((claim) => (
                  <tr key={claim.claim_id} className="hover:bg-zinc-50/50 transition-colors dark:hover:bg-zinc-700/40">
                    <td className="p-4 font-mono text-xs text-zinc-400 dark:text-zinc-500">{claim.claim_id}</td>
                    <td className="p-4 text-zinc-800 font-medium max-w-md dark:text-zinc-200">{claim.text}</td>
                    <td className="p-4 text-zinc-500 dark:text-zinc-400">{claim.source}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusStyle(claim.status)}`}>
                        {claim.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 w-20 bg-zinc-200 rounded-full h-1.5 dark:bg-transparent">
                          <div
                            className="bg-zinc-600 h-1.5 rounded-full dark:bg-zinc-500"
                            style={{ width: claim.confidence }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{claim.confidence}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function Card({ title, value, subtitle }: { title: string; value: number; subtitle: string }) {
  return (
    <div className="border border-zinc-200 rounded-xl p-6 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
      <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider dark:text-zinc-400">{title}</p>
      <p className="text-3xl font-bold mt-2 text-zinc-900 dark:text-zinc-100">{value}</p>
      <p className="text-zinc-400 text-xs mt-1 italic dark:text-zinc-500">{subtitle}</p>
    </div>
  )
}