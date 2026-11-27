# ScholarShield — Scholarship Scam Screening

A beginner-friendly university project using **React + Next.js**, plain JavaScript and CSS. Next.js is a React framework: the interface uses React components, while Next.js supplies the app structure and build process. No AI service, database or API key is needed.

## Run locally

1. Install Node.js 20.9 or newer.
2. Open this folder in VS Code.
3. Run `npm install`.
4. Run `npm run dev` and open http://localhost:3000.
5. Run `npm test` to check the detector. `npm run build` creates a static website in `out/`.

## Features

- Search and risk-filter a scholarship directory.
- Collect public information manually through a form or import JSON records.
- Analyze domains, payment requests, organisation references, similar descriptions and suspicious language.
- Show evidence and points for every rule.
- Save reports with browser localStorage; export collected records to JSON.
- Includes two public-source summaries and one explicitly fictional scam-like example.

## Small code map

- `app/page.js`: React UI, form, navigation, localStorage, import/export.
- `app/globals.css`: responsive layout and appearance.
- `app/layout.js`: page title and root layout.
- `lib/data.js`: manually collected entries and a small organisation/domain reference list.
- `lib/analyze.js`: pure JavaScript analysis functions; start here for your viva.
- `lib/analyze.test.js`: tests for important detection cases.
- `next.config.mjs`: static Next.js export.

## Explain it to your teacher

“Our platform collects publicly available scholarship details and screens them with five transparent rules. The user submits a title, organisation, URL and description. JavaScript checks the data, adds the warning points and returns a report. React renders that report. Next.js builds the app. localStorage keeps records in the current browser.”

Flow: public listing → form/JSON collection → five checks → sum of points → report → optional save.

| Check                | Points | Method                                                            |
| -------------------- | -----: | ----------------------------------------------------------------- |
| Misleading domain    |     25 | Match hostname against reference domains; check imitation markers |
| Payment demand       |     30 | Regular expression matching                                       |
| Unknown organisation |     10 | Look up a small array of known names                              |
| Similar content      |     15 | Jaccard word-set similarity >= 70%, at least 10 unique words      |
| Suspicious language  |     20 | Search for configured phrases                                     |

Total: 0–19 low signals; 20–49 review needed; 50–100 high risk. This is an illustrative warning score, not a fraud probability. Unknown organisations are not automatically fake. Similar content is not proof of copying.

### Example similarity

If text A has 12 unique words, B has 12, and 10 are shared, the union contains 14 words. Similarity = 10 / 14 = 71.4%, which triggers the similarity check. It compares only against collected records, not the internet.

## JSON import format

```json
[
  {
    "title": "Example scholarship",
    "organization": "Example foundation",
    "url": "https://example.org/scholarship",
    "description": "Public description including eligibility and the application process."
  }
]
```

Maximum 100 records per import. HTTP(S) URLs and all four string fields are required.

## Sources and scope

Public summaries collected 10 November 2026:

- https://scholarships.gov.in/All-Scholarships
- https://www.myscheme.gov.in/schemes/psgs-deg

Check official sources for current eligibility, dates and availability. The fictional example uses the reserved `.example` domain.

This simple version collects manually; it does not scrape websites, verify legal registries or search the entire internet for plagiarism. A crawler would require a server, site-specific parsers, rate limiting and access-policy handling, making the project harder to explain. Browser-only persistence is local to each browser and can be cleared; JSON exports back up collected entries, not saved report snapshots. Rules have false positives and false negatives, especially payment negations and unlisted organisations. Do not enter private student data.

## Viva questions

1. Why React and Next.js? React creates interactive components; Next.js organises the project and builds it.
2. Why rule based? Each decision is easy to understand, test and explain without a training dataset.
3. What is useState? It stores interface values such as the form, current page and result.
4. What is useEffect? It loads and saves browser data after rendering.
5. How do you recognise fake organisations? We cannot prove they are fake; we flag unknown names and mismatched domains for review.
6. Why not call a low score “safe”? Scams can avoid the specific patterns our rules detect.
7. How can it improve? Add a backend database, reviewed source collectors, a larger organisation registry, stronger text comparison and evaluation on labelled real-world examples.
