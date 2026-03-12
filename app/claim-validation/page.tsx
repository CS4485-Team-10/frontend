"use client"

import mock from "@/public/mock/mockdata.json"

type Claim = {
  claim_id: string
  text: string
  source: string
  status: "Verified" | "Disputed" | "Under Review"
  confidence: string
  views: string
  date: string
}

export default function ClaimValidationPage() {
  const claims = mock.claim_validation as Claim[]

  const total = claims.length
  const verified = claims.filter((c) => c.status === "Verified").length
  const disputed = claims.filter((c) => c.status === "Disputed").length
  const review = claims.filter((c) => c.status === "Under Review").length

  const statusStyle = (status: string) => {
    if (status === "Verified")
      return "bg-green-100 text-green-700 border-green-200"
    if (status === "Disputed")
      return "bg-red-100 text-red-700 border-red-200"
    return "bg-yellow-100 text-yellow-700 border-yellow-200"
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-semibold">Claim Validation</h1>
          <p className="text-gray-500">
            Review and verify claims with AI-powered confidence scoring
          </p>
        </div>

        <input
          placeholder="Search keywords, hashtags, creators..."
          className="border rounded-lg px-4 py-2 w-96"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card title="Total Claims" value={total} subtitle="Last 30 days" />
        <Card title="Verified" value={verified} subtitle="accuracy" />
        <Card title="Disputed" value={disputed} subtitle="flagged" />
        <Card title="Under Review" value={review} subtitle="pending" />
      </div>

      {/* Claims Table */}
      <div className="bg-white border rounded-xl">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Claims Database</h2>

          <div className="flex gap-3">
            <select className="border rounded-lg px-3 py-2">
              <option>All Status</option>
            </select>

            <select className="border rounded-lg px-3 py-2">
              <option>Confidence: All</option>
            </select>

            <button className="bg-black text-white px-4 py-2 rounded-lg">
              Export
            </button>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead className="text-gray-500 border-b">
            <tr>
              <th className="text-left p-4">Claim ID</th>
              <th className="text-left p-4">Claim Text</th>
              <th className="text-left p-4">Source</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">LLM Confidence</th>
              <th className="text-left p-4">Date</th>
            </tr>
          </thead>

          <tbody>
            {claims.map((claim) => (
              <tr key={claim.claim_id} className="border-b">
                <td className="p-4">{claim.claim_id}</td>

                <td className="p-4 text-gray-700">{claim.text}</td>

                <td className="p-4 text-gray-500">{claim.source}</td>

                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs border ${statusStyle(
                      claim.status
                    )}`}
                  >
                    {claim.status}
                  </span>
                </td>

                <td className="p-4 flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gray-600 h-2 rounded-full"
                      style={{
                        width: claim.confidence,
                      }}
                    />
                  </div>

                  {claim.confidence}
                </td>

                <td className="p-4 text-gray-500">{claim.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Card({
  title,
  value,
  subtitle,
}: {
  title: string
  value: number
  subtitle: string
}) {
  return (
    <div className="border rounded-xl p-6 bg-white">
      <p className="text-gray-500 text-sm">{title}</p>
      <p className="text-3xl font-semibold">{value}</p>
      <p className="text-gray-400 text-sm">{subtitle}</p>
    </div>
  )
}