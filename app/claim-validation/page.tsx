"use client";

import { useEffect, useState } from "react";

type Claim = {
  claim_id: string;
  text: string;
  source: string;
  status: "Verified" | "Disputed" | "Unverified";
  confidence: string;
  views: string;
};

export default function ClaimValidationPage() {
  const [claims, setClaims] = useState<Claim[]>([]);

  useEffect(() => {
    fetch("/mock/mockdata.json")
      .then((res) => res.json())
      .then((data) => {
        setClaims(data.claim_validation);
      })
      .catch((err) => console.error("Error loading mock data:", err));
  }, []);

  const statusColor = (status: string) => {
    if (status === "Verified") return "bg-green-100 text-green-700";
    if (status === "Disputed") return "bg-red-100 text-red-700";
    return "bg-yellow-100 text-yellow-700";
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">
        Claim Validation
      </h1>

      <div className="overflow-hidden rounded-lg bg-white shadow">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-600">
            <tr>
              <th className="px-6 py-3 font-medium">Claim</th>
              <th className="px-6 py-3 font-medium">Source</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Confidence</th>
              <th className="px-6 py-3 font-medium">Views</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {claims.map((claim) => (
              <tr key={claim.claim_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 max-w-md text-gray-800">
                  {claim.text}
                </td>

                <td className="px-6 py-4 text-gray-600">
                  {claim.source}
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor(
                      claim.status
                    )}`}
                  >
                    {claim.status}
                  </span>
                </td>

                <td className="px-6 py-4 text-gray-700">
                  {claim.confidence}
                </td>

                <td className="px-6 py-4 text-gray-700">
                  {claim.views}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
