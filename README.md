# Mira Solves

The content hub for Mira's math TikTok. Next.js (App Router) + TypeScript +
Tailwind v4 + Framer Motion. Content lives in local JSON files — no database, no
CMS, no accounts.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # also validates every content file
npm run lint
```

## Where things are

```
content/                  everything editable without touching code
  problems/*.json         one file per problem
  challenges/*.json       one file per weekly challenge
  daily.json              which problem ran on which date
  site.json               bio, stat rows, social links, press
public/problems/*.svg     problem diagrams (referenced as /problems/x.svg)
reference/
  the-studio-homepage.html   the approved design mockup, kept for reference
src/app/globals.css       THE design tokens — colors, fonts, radii, shadows
src/lib/data/source.ts    the only file that reads the filesystem
src/lib/data/*.ts         the accessors pages use
```

**Design tokens live in exactly one place.** `src/app/globals.css` has a
`@theme` block with every color, font, radius and shadow. Components use the
generated utilities (`bg-paper`, `text-ink-soft`, `shadow-block-red`,
`rounded-panel`). There are no hex values anywhere else — if you need a new one,
add it as a token first.

## Adding a problem

Create `content/problems/my-problem.json`:

```json
{
  "slug": "my-problem",
  "number": 414,
  "title": "The title shown on cards and the detail page",
  "topic": "algebra",
  "difficulty": "medium",
  "statement": "Solve $x^2 - 4 = 0$.",
  "solutionSteps": [
    "First step. One revealable step per entry.",
    "Second step. $$x = \\pm 2$$"
  ],
  "glyph": "$x^2 - 4 = 0$",
  "videoSeconds": 84,
  "solveCount": 1200,
  "publishedAt": "2026-09-12"
}
```

- `topic` must be one of: `algebra`, `geometry`, `calculus`, `probability`,
  `number-theory`, `puzzles`, `statistics`, `olympiad`.
- **Math**: `$...$` for inline, `$$...$$` for a centred block. Rendered with
  KaTeX on the server. In JSON, every LaTeX backslash must be doubled
  (`\\frac`, `\\pi`).
- `solutionSteps` is the reveal order — each entry becomes one step the reader
  unlocks.
- `glyph` (optional) is the short expression lettered across the video
  thumbnail. Leave it out and one is derived from the statement.
- `tiktokUrl` (optional) — see below.
- `figure` (optional) — a diagram; see below.
- The build fails with the file name and field if anything is missing or
  malformed, so a typo can't ship silently.

Nothing else needs updating: the problem appears on `/problems`, `/watch`, its
topic card count, and related-problem lists automatically.

### Adding a diagram

Put the image in **`public/problems/`** and point the problem at it:

```json
"figure": {
  "src": "/problems/my-diagram.svg",
  "alt": "What the diagram shows, in a sentence.",
  "caption": "Optional line under the image",
  "width": 240,
  "height": 240
}
```

- **SVG is the best format** for a maths figure — crisp at any size and tiny.
  PNG, JPG and WebP also work.
- `src` must start with `/problems/`. The path is relative to `public/`, so
  `public/problems/my-diagram.svg` is referenced as `/problems/my-diagram.svg`.
- **`alt` is required.** A geometry diagram with no text alternative is
  invisible to anyone using a screen reader. Describe what the figure shows,
  not that it is a figure.
- `width` and `height` are the image's real pixel dimensions. They reserve the
  space before the file loads so the page doesn't jump as you read.
- `caption` is rendered in small uppercase mono, so avoid maths variables in it
  — "side a + b" would come out as "SIDE A + B".

Two guards run at build time, both naming the problem and field:

```
Error: Problem figures point at files that do not exist:
  - pythagoras-without-words -> public/problems/typo.svg

Error: content/problems/pythagoras-without-words.json failed validation:
  - figure.src: must be a path like /problems/my-diagram.svg
```

`pythagoras-without-words` and `five-points-unit-square` both ship a diagram —
copy either one as a starting point.

### Where to put raw source material

There is nowhere the site reads PDFs, scans or loose notes from. You *can* park
them in `content/problems/` without breaking anything — the loader only reads
`*.json`, so other files are ignored and the build still passes — but nothing
will render them. Turning a PDF or a photo of a notebook into problems is a
manual step: read it, write the JSON.

### Scheduling it as a daily problem

Add a line to `content/daily.json`:

```json
{ "2026-09-12": "my-problem" }
```

Oldest date is day 1. If today isn't listed, `/daily` falls back to the most
recent past entry, so the page is never empty.

## Videos

`<TikTokEmbed>` does both jobs: given a `tiktokUrl` it renders TikTok's official
oEmbed; without one it renders the designed placeholder (the blue gradient panel
with the equation). **No seed problem has a real URL yet**, so every embed on the
site is currently the placeholder — which is why it looks finished. Pasting a
real URL into a content file switches that one over. It's a data change, not a
code change.

## What is deliberately fake

| Thing | State |
|---|---|
| Leaderboards | Placeholder rows in `content/challenges/*.json`. No submissions, timing or ranking. |
| Newsletter signup | Logs to the console and shows a confirmation. Sends no email. |
| `solveCount` | A number in the content file. Nothing increments it. |
| Streak | Real, but `localStorage` only — per browser, no account, cleared with site data. |

Each of these has a `// TODO:` at the exact spot that would change, explaining
what's needed. Grep for `TODO:` to find them.

## The admin panel (/admin)

Content is edited at `/admin` and **committed back to this repository** through
the GitHub API. There is no database: every edit is a commit you can read,
revert or blame, and the site rebuilds from it.

The trade-off is latency — a save takes about a minute to appear on the live
site while Vercel rebuilds. The panel itself always shows the current state,
because it reads the branch rather than the deployed filesystem.

### One-time setup

Everything else is already wired; this is the only part that needs a human,
because GitHub has no API for creating OAuth apps.

**1. Create a GitHub OAuth app** at
<https://github.com/settings/applications/new>

| Field | Value |
|---|---|
| Application name | `Mira Solves Admin (local)` |
| Homepage URL | `http://localhost:3000` |
| Authorization callback URL | `http://localhost:3000/api/auth/callback/github` |

Then **Generate a new client secret**.

An OAuth app allows only one callback URL, so production needs a second app
with the Vercel domain — `https://<your-domain>/api/auth/callback/github`.

**2. Copy `.env.example` to `.env.local`** and fill in:

```bash
AUTH_SECRET=            # npx auth secret
AUTH_GITHUB_ID=         # from step 1
AUTH_GITHUB_SECRET=     # from step 1
ADMIN_LOGINS=           # your GitHub username
GITHUB_REPO=owner/repo
GITHUB_BRANCH=main
GITHUB_OAUTH_SCOPE=public_repo   # a private repo needs: repo
```

**3. `npm run dev`** and open <http://localhost:3000/admin>.

### Who can get in

`ADMIN_LOGINS` (GitHub usernames) and `ADMIN_EMAILS` are both checked, and
matching either is enough. Prefer usernames: a GitHub account can keep its
email private, and the address it signs commits with is frequently not its
primary one, which makes an email-only allowlist a common lockout.

**Leaving both empty denies everyone.** The check fails closed deliberately.

Access is enforced in `requireAdmin()`, called by every admin page and every
Server Action. `src/proxy.ts` also redirects signed-out browsers, but that is
only for the UX — a Server Action is a public HTTP endpoint, so the proxy can
never be the security boundary.

### What the panel can do

- Problems: create, edit, rename, delete; live KaTeX preview of the statement
  and of every solution step; reorder steps; upload a diagram (committed to
  `public/problems/`, with its dimensions measured in the browser).
- Draft / published status. Drafts are filtered out at the data seam, so they
  are absent from every public page, listing, count and prerendered route.
- Concurrent edits are refused, not merged: the blob SHA you loaded is sent
  back on save, so if someone else changed the file first you get an error
  instead of silently overwriting them.

Not built yet: the `/admin/challenges`, `/admin/daily` and `/admin/site`
screens. Those content types are still edited by hand in `content/`.

## Swapping the file-based content for a database or CMS

`src/lib/data/source.ts` is the only module that touches the filesystem.
Everything else calls the async accessors in `src/lib/data/`. Reimplement the
four `load*` functions there against a real backend and no page or component
needs to change — that's why the accessors are async despite reading local
files.

## Deploying

Vercel, default Next.js settings. Pages that show "today" (`/`, `/daily`,
`/daily/archive`, `/challenges`) revalidate hourly; everything else is static.
