# Shega News Analytics Dashboard

A comprehensive Next.js dashboard for comparing and analyzing news content from **Shega Media** and **Addis Insight** Ethiopian news sources.

![Next.js](https://img.shields.io/badge/Next.js-15.1.1-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwindcss)

## Features

### 📊 Dashboard Overview
- KPI cards with comparative metrics (articles, authors, word count, readability)
- Daily publishing trends chart
- Sentiment overview
- Top authors and trending topics
- Competitive insights from AI analysis

### 📈 Analytics Pages

| Page | Description |
|------|-------------|
| **Publishing** | Hourly, weekday, monthly publishing patterns with day/night analysis |
| **Keywords** | Headline, body, meta, TF-IDF extracted, and **trending** keywords |
| **Topics** | Topic modeling, treemap visualization, spike detection |
| **Sentiment** | Sentiment distribution by site with article breakdowns |
| **Authors** | Author productivity, sentiment, and expertise analysis |
| **Categories** | Category distribution and topic coverage |
| **NLP** | Named entity recognition analysis |
| **Entities** | People, organizations, and locations extraction |

### ⚔️ Competitive Analysis
- Head-to-head comparison metrics
- Keyword overlap analysis (shared, exclusive)
- Coverage gaps detection
- Content duplication analysis
- AI-generated competitive insights

## Getting Started

### Prerequisites
- Node.js 18+ 
- Backend API running on `http://localhost:8000`

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd shega-news-dashboard-frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── analytics/          # Analytics pages
│   │   ├── authors/
│   │   ├── categories/
│   │   ├── entities/       # NLP entities page
│   │   ├── keywords/       # Enhanced with trending tab
│   │   ├── nlp/
│   │   ├── publishing/
│   │   ├── sentiment/
│   │   └── topics/
│   ├── articles/
│   ├── comparison/         # Enhanced competitive analysis
│   └── page.tsx            # Dashboard home
├── components/
│   ├── charts/             # Recharts components
│   ├── dashboard/          # Dashboard widgets
│   ├── layout/             # Navigation, sidebar
│   └── ui/                 # shadcn/ui components
├── lib/
│   ├── api.ts              # API service layer
│   ├── config.ts           # API endpoints configuration
│   └── utils.ts
└── types/
    └── api.ts              # TypeScript interfaces
```

## Documentation

See the [docs/](docs/) folder for detailed documentation:
- [API Endpoints](docs/ENDPOINTS.md)
- [Filtering Reference](docs/FILTERING.md)
- [Frontend Integration](docs/INTEGRATION.md)
- [UI/UX Design Proposal](docs/UI_UX_DESIGN_PROPOSAL.md)
- [Frontend API Documentation](docs/FRONTEND_API_DOCUMENTATION.md)
- [Keywords Analytics](docs/KEYWORDS_ANALYTICS_DOCUMENTATION.md)

## Tech Stack

- **Framework**: Next.js 15.1.1 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Charts**: Recharts
- **Icons**: Lucide React

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
npm run test     # Run tests
```

## API Backend

This frontend connects to a FastAPI backend. Ensure the backend is running on port 8000 before starting the dashboard.

```bash
# Backend API base URL
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## License

Private - Shega Media Engineering Team
