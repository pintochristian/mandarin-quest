# Mandarin Quest

Become conversational in Mandarin, one real conversation at a time. Every lesson is built
around a real situation (meeting someone, ordering coffee, asking directions) — never
random vocabulary lists.

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS · shadcn/ui · Framer Motion
· Prisma (SQLite dev / Postgres prod) · Better Auth · Zustand · React Hook Form + Zod ·
Recharts · Anthropic (Claude) for the AI tutor · Web Speech API for STT/TTS.

## Getting started

```bash
npm install              # also runs `prisma generate` (postinstall) against the SQLite schema
cp .env.example .env     # fill in at least BETTER_AUTH_SECRET (openssl rand -base64 32)
npm run db:migrate       # create the local SQLite database (prisma/schema.prisma)
npm run db:seed          # load all 22 lessons + outlines for Levels 3-8 + achievements
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), sign up, pick a practice style, and
start the first lesson. No API keys are required to run the app — see "Running without
an AI key" below.

To reach the admin panel (`/admin`), promote a user's `role` to `ADMIN` in the database
(there's no self-serve promotion flow yet — this is a deliberate MVP scope call):

```bash
npx prisma studio   # open the DB browser, find your user, set role = ADMIN
```

## Running without an AI key

`ANTHROPIC_API_KEY` is **optional**. Leave it unset and the AI tutor, in-lesson AI
conversation step, and mistake classification all run in **mock AI mode**: they return
clearly-labeled simulated replies (a `[Mock AI Tutor — set ANTHROPIC_API_KEY to enable
real replies]` prefix, plus a "Mock AI tutor" badge in the chat UI) instead of erroring.
Every other feature — lessons, SRS review, the knowledge graph, admin import/export — is
completely unaffected either way. Set the key later to switch on real Claude replies with
no code changes.

`ELEVENLABS_API_KEY` / `OPENAI_API_KEY` are optional upgrades over the built-in browser
text-to-speech — leave both unset to use the free browser Web Speech API fallback.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` / `lint:fix` | ESLint |
| `npm run format` / `format:check` | Prettier |
| `npm run test` / `test:watch` | Vitest unit tests |
| `npm run test:e2e` | Playwright end-to-end tests |
| `npm run db:generate` | Regenerate the Prisma client from `schema.prisma` (SQLite) |
| `npm run db:migrate` | Apply Prisma migrations (SQLite, local dev) |
| `npm run db:seed` | Load `/content` into the database (idempotent) — all 22 lessons |
| `npm run db:studio` | Prisma Studio |
| `npm run db:schema:postgres` | Regenerate `prisma/schema.postgres.prisma` from `schema.prisma` |
| `npm run db:generate:postgres` | Regenerate the Prisma client from the Postgres schema |
| `npm run db:push:postgres` | Push the Postgres schema to `$DATABASE_URL` (no migration history) |
| `npm run db:seed:postgres` | Regenerate the Postgres client, then seed `$DATABASE_URL` |
| `npm run vercel-build` | The Vercel build command — see below |

## Deploying to Vercel

The app runs on Vercel out of the box; `vercel.json` already sets the build command, so
this is mostly filling in environment variables.

### 1. Provision a Postgres database

Any standard `postgresql://` provider works — the easiest is Vercel's own Postgres
(Storage tab → Create Database → Postgres) or [Neon](https://neon.tech), which sets
`DATABASE_URL` for you automatically when attached to the project. If you use a different
provider, copy its connection string manually.

### 2. Set environment variables (Project Settings → Environment Variables)

| Variable | Required | Value |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Your Postgres connection string (`postgresql://...`) |
| `BETTER_AUTH_SECRET` | Yes | `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | Yes | Your deployed URL, e.g. `https://your-app.vercel.app` |
| `ANTHROPIC_API_KEY` | No | Omit to run in mock AI mode (see above) |
| `ELEVENLABS_API_KEY` / `OPENAI_API_KEY` | No | Omit to use the free browser TTS fallback |

### 3. Deploy

```bash
vercel        # first deploy, links the project
vercel --prod # subsequent production deploys
```

Or just connect the GitHub repo in the Vercel dashboard and push — same result.

The build command (`npm run vercel-build`, set in `vercel.json`) does, in order:
1. Regenerates `prisma/schema.postgres.prisma` from `prisma/schema.prisma` (they must stay
   in sync — see "Two schemas, one source of truth" below) and the Prisma client against it.
2. `prisma db push` — syncs the Postgres schema to match. This runs on **every** build,
   which is convenient for a solo/early-stage project but has no migration history; if you
   later need real migration tracking (multiple environments, teammates, data you can't
   afford to lose to a schema mistake), switch this step to versioned `prisma migrate
   deploy` files instead.
3. `tsx prisma/seed.ts` — idempotently loads all 22 lessons + outlines + achievements.
4. `next build`.

First deploy takes a bit longer (cold schema push + seed); later deploys are fast since
both steps are no-ops when nothing changed.

### 4. After deploying

- Sign up for an account through the live app.
- Promote yourself to admin: connect to the Postgres database (Vercel's dashboard has a
  built-in query console, or use `psql "$DATABASE_URL"`) and run
  `UPDATE "User" SET role = 'ADMIN' WHERE email = 'you@example.com';`.
- Visit `/admin` to confirm, and use Import/Export to add more content anytime — no
  redeploy needed, it's a runtime API call.

### Two schemas, one source of truth

Prisma bakes the SQL dialect into the generated client at `prisma generate` time, so one
generated client can't serve both SQLite (dev) and Postgres (prod). Rather than
hand-maintaining two schema files, `scripts/generate-postgres-schema.mjs` derives
`prisma/schema.postgres.prisma` from `prisma/schema.prisma` on demand (it's gitignored —
regenerated by every `db:*:postgres` script and by `vercel-build`). **Only ever edit
`prisma/schema.prisma`** — the Postgres variant is always regenerated, never hand-edited.

If you run any `*:postgres` script locally, it overwrites your local `lib/generated/prisma`
client with the Postgres-flavored one, which will break `npm run dev` (expects SQLite)
until you run `npm run db:generate` again to switch back.

## Architecture notes

- **Data-driven curriculum**: lessons are never hardcoded in components. They're authored
  as validated JSON (`lib/validation/content.ts`), loaded via `prisma/seed.ts` at
  build/dev time or through the admin panel's JSON import pipeline
  (`app/admin/import`) at runtime — the same import path both use
  (`lib/content/import.ts`), so adding content never requires a code change.
- **Multi-language ready**: every content table is scoped under `Language`. Adding
  Japanese, Korean, Spanish, etc. is a data change (seed a new `Language` row and its
  content), not a schema change.
- **No-microphone-required**: every speaking exercise ships with typed, tile-based, and
  listening alternatives to the microphone (see `lib/interaction-mode.ts` and
  `components/lesson/exercises/speaking-modes/`), selected by the learner's
  `practiceMode` setting. Lesson completion never gates on mic use.
- **Mobile-first**: the whole app is designed and tested at a 375px viewport first. All
  primary buttons, icon buttons, inputs, and selects meet a 44px minimum tap target
  (`components/ui/button.tsx`, `input.tsx`, `select.tsx`); dense secondary elements (the
  per-word audio button, admin dialog close buttons) deliberately stay compact. There's no
  desktop-only interaction anywhere in the learner-facing app — everything is tap-driven.
- **Knowledge graph curriculum**: every teachable concept (vocabulary, grammar,
  sentence patterns, and more as the platform grows) is a `KnowledgeNode`, linked to
  lessons via `LessonNode` and to each other via `NodeEdge` prerequisites. A single
  SM-2 implementation (`lib/srs/sm2.ts`) schedules review for every node type
  together via `UserNodeMastery` — no per-type review tables. The same word or
  grammar point reappearing across lessons resolves to one shared node (and one
  shared mastery record), which is how vocabulary reuse across the curriculum is
  tracked.
- **Known limitation**: pronunciation/tone scoring (`lib/speech/pronunciationScore.ts`)
  is a text-similarity heuristic, not real acoustic tone analysis — the browser's Web
  Speech API only exposes recognized text, not pitch data. It's isolated behind a
  `PronunciationScorer` interface so a real acoustic model can be swapped in later.
