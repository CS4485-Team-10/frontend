# YouTube Intelligence Platform — Frontend

Frontend for the **YouTube Intelligence Platform**: a dashboard that surfaces narratives, claims, trends, and creator risk around YouTube content, backed by the platform API. The app provides a shell with navigation, theming, and in-app notifications across the main workflows below.

## Installation & Setup

**Stack:** [Next.js](https://nextjs.org) (App Router), React 19, TypeScript, [Tailwind CSS](https://tailwindcss.com) v4, [Recharts](https://recharts.org) for charts, and [Lucide](https://lucide.dev) for icons.

1. **Dependencies**
  ```bash
   npm install
  ```
2. **Backend API**
  UI calls `NEXT_PUBLIC_BACKEND` (defaults to `http://localhost:8000`). Configure it in your .env, if set elsewhere.
3. **Git Hooks**
  ```bash
   bash scripts/setup-hooks.sh
  ```
   Or manually:
   Pre-commit runs ESLint, TypeScript (`tsc --noEmit`), and `next build`.
4. **Development Server**
  ```bash
   npm run dev
  ```
   Open [http://localhost:3000](http://localhost:3000) — the root route redirects to **Executive Overview**.

**Other scripts:** `npm run build`, `npm run start`, `npm run lint`, `npm run typecheck`.

## Main Features

- **Executive Overview** — High-level KPIs, topic trends, clusters, and recent claims in one view so you can see overall scope, activity, and verification status at a glance.
- **Narrative Discovery** — Browse and search detected narratives, sort by momentum or risk, and open details or hand off context to other areas of the app.
- **Claim Validation** — Review extracted claims with verification status (verified, disputed, under review, etc.), summary stats, search, and filters.
- **Trend Analytics** — Charts for topic momentum and sentiment shifts over selectable time ranges, tied to overview and narrative data.
- **Creator Risk Monitor** — Rank and search creators by risk score, flagged claims, and reach to focus on higher-impact channels.
- **Alerts & Settings** — View risk-tiered alerts, tweak notification-related preferences, and jump from alerts into related narratives where supported.

## Developer Notes

### Deployment

This frontend is deployed on **[Vercel](https://vercel.com)** (Next.js-native hosting). Configure production `NEXT_PUBLIC_BACKEND` and any other environment variables in the Vercel project settings to point at your deployed API.

### Related Repositories

- [YouTube Intelligence Platform — Backend](https://github.com/CS4485-Team-10/backend)

## Acknowledgements & Artifacts

Developed for the CS4485 Senior Design course at UT Dallas under the mentorship of Dr. Selim Sarac. 

**Team**: Bhavesh Mandalapu, Advay Chandramouli, Anish Kothuri, Pranav Pillai, Praneet Komandur, Pratyush Niraula

**Project Artifacts**:

- [Final Technical Report](https://docs.google.com/document/d/1io4LL0g5Zvy8MGH4SOAGt4XD8-wFtW3L18-DAp_ljHg/edit?tab=t.0)
- [Final Project Presentation](https://canva.link/stort89tnhxjsmp)

