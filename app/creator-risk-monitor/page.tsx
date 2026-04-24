"use client";

import React, { useState } from 'react';
import mockData from '@/public/mock/mockdata.json';

type Creator = (typeof mockData.creator_risk_monitor)[number];

const CreatorRiskMonitor = () => {
  const creators = mockData.creator_risk_monitor;
  const [creatorSearch, setCreatorSearch] = useState("");

  const term = creatorSearch.trim().toLowerCase();
  const filtered = term === ""
    ? creators
    : creators.filter((c) => c.handle.toLowerCase().includes(term));

  return (
    <div className="p-8 bg-zinc-50 min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Creator Risk Monitor</h1>
          <p className="text-zinc-500 mt-1">Assess and track high-risk content creators based on flagged health claims.</p>
        </div>
        <div className="flex gap-3">
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-zinc-400 uppercase ml-1 mb-1">Filter by Creator</label>
            <input
              type="text"
              value={creatorSearch}
              onChange={(e) => setCreatorSearch(e.target.value)}
              placeholder="Search creators…"
              className="border border-zinc-200 rounded-lg px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-200"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-zinc-400 uppercase ml-1 mb-1">Sort Order</label>
            <select className="border border-zinc-200 rounded-lg px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-200">
              <option>Risk Score: High to Low</option>
              <option>Reach: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map((creator, index) => (
          <CreatorCard key={index} creator={creator} />
        ))}
      </div>
    </div>
  );
};

const CreatorCard = ({ creator }: { creator: Creator }) => {
  // Normalize score for the gauge (if score is 1-10, multiply by 10 for percentage)
  const scorePercent = creator.risk_score * 10;
  
  const getRiskStatus = (score: number) => {
    if (score >= 8) return { label: 'High Risk', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' };
    if (score >= 5) return { label: 'Medium Risk', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' };
    return { label: 'Low Risk', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' };
  };

  const status = getRiskStatus(creator.risk_score);

  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
      <div>
        {/* Profile Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center border border-zinc-200">
              <span className="text-zinc-400 font-bold text-xl">{creator.handle[1].toUpperCase()}</span>
            </div>
            <div>
              <h3 className="font-bold text-zinc-900 leading-tight">{creator.handle}</h3>
              <div className={`mt-1 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${status.bg} ${status.color} ${status.border}`}>
                {status.label}
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-zinc-400 uppercase">Reach</p>
            <p className="text-sm font-bold text-zinc-900">{creator.reach}</p>
          </div>
        </div>

        {/* Risk Gauge Visual */}
        <div className="relative flex flex-col items-center py-4 bg-zinc-50 rounded-lg mb-6 border border-zinc-100">
          <div className="relative w-36 h-20 overflow-hidden">
            {/* Background Arch */}
            <div className="absolute top-0 w-36 h-36 border-[14px] border-zinc-200 rounded-full"></div>
            {/* Active Progress Arch */}
            <div 
              className="absolute top-0 w-36 h-36 border-[14px] rounded-full border-transparent border-t-current border-l-current transition-all duration-1000 ease-out"
              style={{ 
                color: creator.risk_score >= 8 ? '#ef4444' : creator.risk_score >= 5 ? '#f59e0b' : '#10b981',
                transform: `rotate(${(scorePercent / 100) * 180 - 45}deg)` 
              }}
            ></div>
          </div>
          <div className="mt-2 text-center">
            <span className="text-3xl font-black text-zinc-900">{creator.risk_score}</span>
            <span className="text-zinc-400 font-medium ml-1">/ 10</span>
          </div>
        </div>

        {/* Stats List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-zinc-50 pb-2">
            <span className="text-xs text-zinc-500 font-medium">Flagged Claims</span>
            <span className="text-sm font-bold text-zinc-900">{creator.flagged_claims}</span>
          </div>
          <div className="flex justify-between items-center border-b border-zinc-50 pb-2">
            <span className="text-xs text-zinc-500 font-medium">Verification Status</span>
            <span className="text-xs font-bold text-zinc-400 uppercase">Awaiting Manual Audit</span>
          </div>
        </div>
      </div>

      <button className="w-full mt-6 bg-zinc-900 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-black transition-all active:scale-[0.98]">
        View Detailed Audit
      </button>
    </div>
  );
};

export default CreatorRiskMonitor;