export type RiskLevel = "High" | "Medium" | "Low";

export type Narrative = {
  id: string;
  title: string;
  description: string;
  detail: string;
  category: string;
  riskLevel: RiskLevel;
  riskScore: number;
  videosAnalyzed: number;
  totalViews: string;
  timeWindow: string;
  primaryLink: string;
};

export const narratives: Narrative[] = [
  {
    id: "nar-ozempic",
    title: "Ozempic Weight Loss & Safety",
    description:
      "Analysis of weight loss claims and safety concerns surrounding Ozempic usage across health influencer content.",
    detail:
      "High-volume influencer coverage is amplifying both legitimate medical guidance and unverified shortcuts for rapid weight loss. Content frequently downplays side effects, long-term metabolic impact, and proper clinical supervision. This narrative cluster leans heavily on anecdotal before-and-after stories and cross-promotes supplements or adjacent products.",
    category: "Health & Wellness",
    riskLevel: "High",
    riskScore: 8.2,
    videosAnalyzed: 1247,
    totalViews: "15.3M",
    timeWindow: "Last 90 days",
    primaryLink: "[LINK]",
  },
  {
    id: "nar-climate-denial",
    title: "Climate Change Denial",
    description:
      "Tracking climate science misinformation and denial narratives across educational and news content.",
    detail:
      "Narratives in this cluster frame climate change as exaggerated, cyclical, or purely political. Creators frequently cherry-pick short-term weather events, question scientific consensus, and cross-link to blogs or think-tank reports with weak or undisclosed funding sources.",
    category: "Science & Environment",
    riskLevel: "High",
    riskScore: 7.8,
    videosAnalyzed: 892,
    totalViews: "8.7M",
    timeWindow: "Last 60 days",
    primaryLink: "[LINK]",
  },
  {
    id: "nar-election-fraud",
    title: "Election Fraud Claims",
    description:
      "Monitoring election integrity discussions and fraud allegations across political commentary channels.",
    detail:
      "Videos in this narrative allege systemic manipulation of voting systems, ballot harvesting, and biased counting procedures. Many sources rely on unverified screenshots, low-quality footage, or second-hand reports while calling for investigations or protest actions.",
    category: "Politics & Policy",
    riskLevel: "Medium",
    riskScore: 6.4,
    videosAnalyzed: 2156,
    totalViews: "22.1M",
    timeWindow: "Last 30 days",
    primaryLink: "[LINK]",
  },
  {
    id: "nar-ai-safety",
    title: "AI Safety Concerns",
    description:
      "Analysis of artificial intelligence safety discussions and potential risk narratives in tech content.",
    detail:
      "This narrative spans discussions of model alignment, job displacement, deepfakes, and speculative existential risk. While many channels provide nuanced analysis, a subset relies on sensational framings that overstate timelines or likelihood of catastrophic outcomes.",
    category: "Technology",
    riskLevel: "Low",
    riskScore: 2.1,
    videosAnalyzed: 567,
    totalViews: "3.2M",
    timeWindow: "Last 120 days",
    primaryLink: "[LINK]",
  },
  {
    id: "nar-crypto-scams",
    title: "Cryptocurrency Scams",
    description:
      "Tracking fraudulent investment schemes and pump-and-dump narratives in financial content.",
    detail:
      "Content in this narrative aggressively promotes high-yield tokens, unregistered projects, and referral-driven investment schemes. Creators often emphasize urgency, exclusive access, and insider tips while minimizing regulatory or liquidity risks.",
    category: "Finance",
    riskLevel: "High",
    riskScore: 9.1,
    videosAnalyzed: 1834,
    totalViews: "11.8M",
    timeWindow: "Last 45 days",
    primaryLink: "[LINK]",
  },
  {
    id: "nar-vaccine-misinformation",
    title: "Vaccine Misinformation",
    description:
      "Monitoring vaccine-related misinformation and alternative health narratives across wellness channels.",
    detail:
      "This narrative blends legitimate questions about side effects with broad, unsupported claims about long-term harm, fertility issues, and microchipping. Channels frequently point viewers toward alternative treatments or supplements that lack strong clinical evidence.",
    category: "Health & Wellness",
    riskLevel: "Medium",
    riskScore: 5.7,
    videosAnalyzed: 723,
    totalViews: "5.9M",
    timeWindow: "Last 90 days",
    primaryLink: "[LINK]",
  },
];

