# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **This is NOT the Next.js you know.** Next.js 16 has breaking changes — read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## Commands

- `npm run dev` — start the Turbopack dev server (Next.js 16 uses Turbopack by default; no `--turbopack` flag needed).
- `npm run build` — production build.
- `npm run start` — serve the production build.
- `npm run lint` — `biome check` (lint + import sort). `next lint` was removed in v16; Biome is the only linter wired up.
- `npm run format` — `biome format --write`.
- To auto-fix lint issues run `npx biome check --write .` directly (no npm script for this).

There is no test runner configured in this project.

## Architecture

**Single-app Next.js 16 App Router project.** A marketing/landing site for "Gridnix" (Traditional Chinese, `lang="zh-TW"`). The dependency tree is minimal — only `next`, `react`, and `react-dom` as runtime deps.

Routes under `app/`:

- `app/layout.tsx` — root layout; loads Inter via `next/font/google`, applies `--font-inter` CSS variable, sets `<title>` and description.
- `app/page.tsx` — the homepage. The entire page is wrapped in a `<Browser>` component (a faux Chrome-window frame with a fake URL bar) so the site renders as a screenshot-style mockup. All sections (Header, hero, stats, features, pricing, reviews, CTA, Footer) and their data live in this single file. Data is typed as inline `readonly` tuples and `as const` — preserve this pattern when adding sections.
- `app/verify/page.tsx` — Client Component (`"use client"`) implementing a 6-digit 2FA OTP entry UI. Not wrapped in `<Browser>`; centers a standalone card. Uses `useRef`/`useState` for auto-advancing inputs.

There is **no `components/` directory** — all components are co-located inside their route files.

Routes referenced in JSX (`/login`, "Console") with no corresponding `app/` directory are intentional dead links — they don't exist yet.

**Styling**: Tailwind CSS v4 via `@tailwindcss/postcss`. No `tailwind.config.*` — all configuration is done via `@theme inline` blocks in `app/globals.css`. Brand palette: `#3D7BFF` (blue) / `#111827` (ink) / `#F5F5F5` (background). Custom keyframes (`float`, `numberFloat`) live in `globals.css` and are referenced with Tailwind's arbitrary-value syntax (`animate-[numberFloat_1.8s_...]`).

**TypeScript**: strict mode, `paths: { "@/*": ["./*"] }`.

**React Compiler is enabled** (`reactCompiler: true` in `next.config.ts`). Don't add `useMemo`/`useCallback`/`React.memo` — the compiler handles memoization. Builds are slower because Babel runs on every component.

**Biome** (v2) is the formatter and linter. Key settings: 2-space indent, single quotes, no trailing semicolons (`asNeeded`), trailing commas everywhere, `import type` enforced for type-only imports, imports auto-sorted.

## Next.js 16 gotchas (your training data is likely Next 14/15)

This project runs Next.js **16.2.6**. The bundled docs at `node_modules/next/dist/docs/` are authoritative — read them before assuming an API.

- `params`, `searchParams`, `cookies()`, `headers()`, `draftMode()` are **async only** — sync fallback from v15 is gone. Use `await props.params` in pages, and the `PageProps<'/route'>` / `LayoutProps<'/route'>` generated helpers (run `npx next typegen`).
- `middleware.ts` is deprecated → renamed to `proxy.ts` (Node.js runtime only, no edge). Config flag `skipMiddlewareUrlNormalize` → `skipProxyUrlNormalize`.
- `revalidateTag(tag)` now requires a second `cacheLife` argument: `revalidateTag('posts', 'max')`. For read-your-writes in Server Actions use `updateTag()`. New `refresh()` refreshes the client router from a Server Action.
- `cacheLife` and `cacheTag` are stable — drop the `unstable_` prefix.
- Partial Prerendering: `experimental_ppr` is gone; opt in via top-level `cacheComponents: true`.
- Parallel route slots must each have a `default.js` or builds fail.
- `images.domains` deprecated → use `images.remotePatterns`. Local images with query strings need `images.localPatterns.search`.
- Removed: `next lint`, AMP (`next/amp`, `useAmp`), `serverRuntimeConfig`/`publicRuntimeConfig`, `unstable_rootParams`, `next/legacy/image`. For runtime env vars use `connection()` from `next/server` before reading `process.env`.
- Turbopack config moved from `experimental.turbopack` to top-level `turbopack`. A custom `webpack` config now fails the build unless you pass `--webpack`.
- React is on the 19.2 canary line in the App Router (View Transitions, `useEffectEvent`, `Activity` are available).
