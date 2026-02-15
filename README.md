## Hackathon prototype: Meeting → Insights → CRM + VoC

This is a small **Next.js** prototype that turns customer meeting transcripts/notes into structured insights for:

- **Sales reps**: opportunity timeline + briefing card + follow-up email draft
- **Product/VoC**: aggregated pain points / feature requests / objections / competitor mentions

### Mock CRM dataset (hackathon data)

The app uses the provided “Salesforce-like” mock dataset located at:

- `src/data/crm.json` (products, accounts, contacts, opportunities, activities)

Activities are treated as “meetings”. Participant names are resolved from `participants_contact_ids` → contacts.

#### Insights in existing mock data

The provided dataset includes `tags` and `outcome` but not precomputed insight objects.
To keep the UI useful out-of-the-box, the app generates **heuristic insights** from `tags/outcome/notes_raw`.

When you record a new meeting, you can also run **AI extraction** (Anthropic) and then save the extracted insights back into `crm.json`.

> Note: when we save a new meeting, we persist `insights` into `src/data/crm.json` under the activity (a non-Salesforce field), so VoC and Sales views can immediately reuse it.

## Getting Started

First, run the development server:

```bash
npm install
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Optional: enable AI extraction (Anthropic)

Create `.env.local`:

```bash
ANTHROPIC_API_KEY=...
```

Then go to **Sales View → pick an opportunity → New Meeting → Extract Insights with AI**.

### Useful API endpoints

- `GET /api/products`
- `GET /api/accounts`
- `GET /api/contacts?accountId=...`
- `GET /api/opportunities?accountId=...&productId=...&stage=...`
- `GET /api/meetings?opportunityId=...&productId=...&region=...&stage=...&dateFrom=...&dateTo=...`
- `GET /api/voc?productId=...&region=...&stage=...&dateFrom=...&dateTo=...`

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## 🔄 Recent Updates (sepideh-feature)

### 🆕 VoC Strategic Summary Page

A new executive summary page is available at `/voc/summary`.

Features:

- Filter-aware navigation (Product, Region, Stage, Date)
- URL-based filter persistence
- Strategic insight block based on selected stage
- Return button to navigate back to the VoC dashboard

---

### 📊 Interactive Data Visualizations

Added data visualizations using **Recharts**:

- Top 5 Pain Points – Horizontal bar chart
- Top 5 Feature Requests – Horizontal bar chart
- Top 5 Objections – Horizontal bar chart
- Top 5 Competitors – Purple gradient pie chart

Charts dynamically update based on selected filters.

---

### 🎯 Stage-Based Strategic Insight

The summary page provides contextual executive insights:

- **Discovery stage** → Focus on early problem validation and pain signals
- **Evaluation stage** → Focus on competitive positioning and deal risk

---

### 🎨 UI Refinements

- Removed “Top” from section titles on the main VoC dashboard
- Updated summary page titles to include “Top 5”
- Improved chart styling and visual consistency

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
