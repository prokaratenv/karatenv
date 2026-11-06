# Engage Social Dashboard

One place to see how every post performs across **YouTube, Instagram, Facebook, TikTok and LinkedIn**
(business and personal accounts), with analysis that tells you what content your audience wants
and specific suggestions for what to post next. Built for Engage Lifestyle Martial Arts / CD Young,
where Opus Clip posts clips nightly to several platforms.

Everything runs in the browser. Exports you import are stored in the browser (IndexedDB) and are never uploaded.

## What it does

| Tab | What you get |
|---|---|
| **Overview** | Views, posts, engagement rate, shares, followers gained (vs the previous period), weekly views by platform, per-account table, most-viewed posts |
| **Suggestions** | Ranked to-dos (content, format, timing, platform, engagement, Opus Clip, consistency), each with the evidence behind it. "Copy brief" / "Generate plan with Claude" turn the numbers into a 7-day content plan, hook lines and title rewrites |
| **Insights** | Topics, auto-discovered keywords, best video length (per platform), title/hook patterns, day × time heatmap, hashtags, formats, Opus Clip vs other posts, and whether Opus's virality score predicts real results |
| **Content** | Every post, searchable, sortable, tagged by topic |
| **Clips** | The same clip matched across platforms, and which platform gets the most out of a clip |
| **Import** | Drag in CSV exports; auto-detects the platform and columns, with a mapping editor and preview |
| **Settings** | Accounts, editable topic keyword lists, optional Claude API key |

### How the analysis works

* **Lift** = a post's views ÷ the median views of the same account. 1× is a typical post. Because every
  comparison uses lift, a 300-view LinkedIn post and a 30K-view TikTok can be compared fairly.
* Posts under 2 days old are still collecting views, so they are left out of pattern analysis.
* Sample sizes count **distinct clips**, not posts: one clip cross-posted to 4 accounts counts once,
  so a single lucky clip can't masquerade as a trend.
* Suggestions are scored by effect size × evidence, and anything with weak evidence is dropped.

## Getting your data

See the **Import** tab for step-by-step instructions. In short:

* **YouTube**: Studio → Analytics → Advanced mode → Content → download CSV ("Table data.csv")
* **Instagram / Facebook**: Meta Business Suite → Insights → Content → Export data (once per account)
* **TikTok**: TikTok Studio → Analytics → Content → Download data (once per account)
* **LinkedIn**: Profile → Analytics → Post impressions → Export
* **Opus Clip**: tick "Posted by Opus Clip" when importing platform exports, or import an Opus export that has a Platform column

Re-import every week or month: re-importing refreshes the numbers on existing posts.

## Running it

```bash
cd social-dashboard
npm install
npm run dev            # http://localhost:5173
npm test               # importer + analysis tests
npm run build          # static site in dist/ (host anywhere)
npm run build:single   # one self-contained dist-single/index.html you can open from disk
npm run build:artifact # hosted variant without downloads / direct API calls
```

The demo data (clearly labeled) loads on first run and is removed automatically when you import real data.

## Code map

* `src/import/`: CSV parsing, column aliases for each platform, number/date/duration parsing
* `src/analysis/`: `analyze.ts` (metrics, lift, topics, timing, length, hooks, clusters),
  `recommendations.ts` (suggestion rules), `topics.ts` (topic library), `clusters.ts` (cross-post matching), `brief.ts` (AI brief)
* `src/views/`: one file per tab; `src/components/`: charts and tooltip
* `src/lib/ai.ts`: optional Claude call (browser, user's own key)

## Next steps worth considering

* Direct API connections (YouTube Data/Analytics API, Meta Graph API, TikTok API) instead of CSV exports.
  Each needs a registered developer app and OAuth, and Meta/TikTok require app review.
* A small backend so data syncs across devices and a nightly job pulls fresh numbers.
* Pull follower counts over time (account-level exports) to chart audience growth.
