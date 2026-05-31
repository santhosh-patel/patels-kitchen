# Patel's Kitchen

A polished restaurant web app for **Patel's Kitchen**. Browse a 50-item menu, apply coupons, checkout with UPI, track orders, and consult **Chef AI** — persisted in the browser via `localStorage`. Includes a full admin dashboard for menu, orders, analytics, and settings.

## Routes

| URL | Page |
|-----|------|
| `/` | Home — story, heritage, AI intro |
| `/menu` | Full menu, packaging, ordering |
| `/track?id=PK-xxxxx` | Order tracking |
| `/admin` | Admin dashboard (PIN: `1234`) |
| `/privacy`, `/terms` | Legal pages |

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Chef AI (optional locally)

For local dev, Chef AI uses the **local fallback** unless you run with Vercel CLI:

```bash
npx vercel dev
```

Set `GROQ_API_KEY` in `.env` (see `.env.example`).

## Deploy to Vercel

1. Push this repo to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Framework preset: **Vite**
4. Add environment variable: `GROQ_API_KEY` = your [Groq API key](https://console.groq.com)
5. Deploy

Build settings are in `vercel.json` (`npm run build` → `dist/`).

## Notes

| Topic | Detail |
|-------|--------|
| **Data storage** | Orders, menu, settings stored in browser `localStorage` — per device |
| **Admin PIN** | Default `1234` — change in Admin → Settings |
| **Sample coupon** | Try `ROYAL20` in cart |
| **Reset data** | Admin → Settings → Restore Sample Data |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint |

## Architecture

- **Frontend:** React 19 + Vite 8
- **State:** React Context + `localStorage` (`src/data/store.js`)
- **Routing:** Path-based (`/`, `/menu`, `/admin`, …)
- **AI:** `api/chef-ai.js` Vercel serverless function (Groq proxy)

No database required.
