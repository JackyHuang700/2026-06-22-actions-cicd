<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AGENTS.md — v2sys Codebase Guide

This file documents project conventions, architecture, and workflows for AI coding agents working in this repository.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, React 19) |
| Language | TypeScript 5 |
| UI Library | Ant Design 6 + shadcn/ui (Radix UI) |
| Styling | Tailwind CSS 4 |
| State | Zustand 5 |
| Server State | TanStack React Query 5 |
| Forms / Validation | Zod 3 |
| Animation | Framer Motion 12 |
| i18n | i18next + react-i18next (en / zh-TW) |
| Linting / Formatting | Biome 2 |
| Testing | Vitest 3 + Testing Library + Playwright |
| Deployment | PM2 + Kubernetes |

---

## Commands

```bash
# Development
npm run dev          # Next.js dev server (Turbopack)
npm run devs          # Next.js dev server (Turbopack + HTTPS)

# Build
npm run build        # Production build

# Test
npm run test         # Run Vitest

# Lint & Format
npm run lint         # Next.js ESLint
npm run lint:fix     # Biome auto-fix
npm run format       # Biome format (write)
```

---

## Project Structure

```
app/                              # Next.js App Router — page.tsx files are MINIMAL wrappers
  (dashboard)/                    # Authenticated dashboard group (shared layout)
    dashboard/page.tsx            # ⤷ delegates to components/dashboard/dashboard-index.tsx
    users/page.tsx                # ⤷ delegates to components/users/users-index.tsx
  admin-api/                      # Next.js Route Handlers (API proxy)
  login/page.tsx                  # ⤷ delegates to components/login/login-index.tsx
  page.tsx                        # ⤷ delegates to components/home/home-index.tsx
components/                       # All React components + logic
  react-query/                    # API fetch functions & React Query hooks
  shared/                         # Reusable presentational primitives
  shared-custom/                  # Custom shared components
  <feature>/                      # Feature-specific components, stores, types
    <feature>-index.tsx           # Orchestrator paired with app/<feature>/page.tsx
    <feature>-table.tsx           # Sub-component
    use-<feature>-...-store.ts    # Zustand store
lib/                              # Utility functions (lib/utils.ts — cn helper)
utils/                            # Standalone utility modules (e.g. oss-client)
public/locales/                   # i18n JSON files (en.json, zh-TW.json)
markdown/                         # Internal documentation and API specs
```

---

## Architecture Patterns

### API Layer (two-file split)

All backend communication lives in `components/react-query/`:

**`use-api.ts`** — Raw async fetch functions + TypeScript types
- Every endpoint defines: `XxxParams` interface, `XxxResp200` interface, and an `async` fetch function accepting `QueryFunctionContext`.
- **Ordering** — endpoints (interfaces + fetch fn block) must be grouped and sorted by HTTP method in this order: `GET` → `POST` → `PATCH` → `PUT` → `DELETE`. Within each method group, sort alphabetically by path.
- All requests target `process.env.NEXT_PUBLIC_BACKEND_URL`.
- Auth: `getHeaders()` reads JWT from cookie; if `IS_OPEN_HTTP_ONLY` is true, it fetches via `/admin-api/get-cookie`.
- Error: `getHandleApiError(response)` — triggers logout on 401, throws a typed error on other failures.
- Query params: built using `URLSearchParams`, appended only if defined.

**`use-react-query.ts`** — React Query hook wrappers
- Every endpoint has a `QUERY_KEY_*` string constant.
- **Ordering (both QUERY_KEY constants and hook functions)** — must be grouped and sorted by HTTP method in this order: `GET` → `POST` → `PATCH` → `PUT` → `DELETE`. Within each method group, sort alphabetically by path.
- **GET hooks** → `apiGetXxx(params, options?)` wraps `useQuery`. Most spread `REACT_QUERY_DEFAULT_PARAMS` (`keepPreviousData` + `refetchInterval`).
- **Mutation hooks** → `apiPostXxx(options, setSuccess, setError)` wraps `useMutation`. Callbacks (`onSuccess`, `onError`) are passed as arguments, not defined inline.

```ts
// Example GET hook pattern
export const apiGetMerchantList = (params: GetApiListMerchantParams, options?) =>
  useQuery({
    queryKey: [QUERY_KEY_API_LIST_MERCHANT, params],
    queryFn: getApiListMerchant,
    ...REACT_QUERY_DEFAULT_PARAMS,
    ...options,
  })

// Example mutation hook pattern
export const apiPostCreateMerchant = (options?, setSuccess?, setError?) =>
  useMutation({
    mutationFn: postApiCreateMerchant,
    onSuccess: (data) => { setSuccess?.(data) },
    onError: (error) => { setError?.(error) },
    ...options,
  })
```

### State Management (Zustand)

One Zustand store per feature slice, always wrapped with `devtools` middleware.

```ts
// Naming: use-<feature>-<slice>-store.ts
export const useMerchantTableStore = create<UseMerchantTableStore>()(
  devtools((/* set, get */) => ({
    current: PAGINATION_CURRENT,
    pageSize: PAGINATION_PAGE_SIZE,
    total: PAGINATION_TOTAL,
    // ...state
  })),
)

// Companion reset helper (exported alongside the store)
export const setResetAllDataByUseMerchantTableStore = (params?) =>
  useMerchantTableStore.setState({ ...defaults, ...params })
```

- State mutations use `useMerchantTableStore.setState(...)` directly (not via a setter in the store).
- Pagination defaults from `components/ant/use-ant-table.ts`: `PAGINATION_CURRENT = 1`, `PAGINATION_PAGE_SIZE = 10`.

### Page ↔ Index Pairing (mandatory)

Every `app/<path>/page.tsx` corresponds 1:1 with a `components/<feature>/<feature>-index.tsx`:

| Route | Page wrapper | Orchestrator (this is where the work happens) |
|---|---|---|
| `/` | `app/page.tsx` | `components/home/home-index.tsx` |
| `/login` | `app/login/page.tsx` | `components/login/login-index.tsx` |
| `/dashboard` | `app/(dashboard)/dashboard/page.tsx` | `components/dashboard/dashboard-index.tsx` |
| `/template` (example) | `app/template/page.tsx` | `components/template/template-index.tsx` |

Rules:

1. **`page.tsx` must stay minimal.** It is a Server Component by default. It does server-only work (for example `await cookies()`, `await props.params`, initial `fetch()`) and then renders the matching `<FeatureIndex />` with props. It must NOT contain UI markup, inline helpers, `useState`, or `'use client'`.
2. **`<feature>-index.tsx` lives under `components/<feature>/`, NEVER under `app/`.** Do not place orchestrator files next to `page.tsx`. Inner sub-components, inline helpers, derived constants and types stay inside the index file (see "File-level Ordering" below).
3. **Pages with no server work** still keep the page.tsx thin — it just renders `<FeatureIndex />` and assigns a `displayName`.
4. **Server-fetched initial data** is passed as a prop named `initialData` (or a descriptive name) into `<FeatureIndex initialData={...} />`; the index then seeds React Query via `initialData` option.
5. **`await connection()` is conditional, not mandatory.** Use `await connection()` only when the page must run at request time (for example auth/cookies/headers/personalized server fetch). Do not add `connection()` to every page by default.
6. **`page.tsx` export naming must match the file name.** Use `export default function Page()` (or `export default async function Page()`), and set `Page.displayName = 'Page'`.

Minimal page.tsx template (no server work):

```tsx
import { HomeIndex } from '@/components/home/home-index'

export default function Page() {
  return (<HomeIndex />)
}
Page.displayName = 'Page' // -----------------------------<< Component >>-----------------------------
```

Minimal page.tsx template (with server-side data fetching):

```tsx
import { cookies } from 'next/headers'
import { connection } from 'next/server'
import { UsersIndex } from '@/components/users/users-index'
import { ACCESS_TOKEN_COOKIE } from '@/components/react-query/use-api'

export default async function Page() {
  await connection()
  const cookieStore = await cookies()
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value

  let initialData: GetResellerMeUsersResp200 | undefined
  // ...fetch with token...

  return (<UsersIndex initialData={initialData} />)
}
Page.displayName = 'Page' // -----------------------------<< Component >>-----------------------------
```

### Component Structure

Feature components follow a consistent split inside `components/<feature>/`:

| File | Purpose |
|---|---|
| `<feature>-index.tsx` | Orchestrator paired with `app/<feature>/page.tsx` — wires refs, handlers, layout |
| `<feature>-table.tsx` | Ant Design table with columns |
| `<feature>-filter.tsx` | Search / filter form |
| `<feature>-create.tsx` | Create drawer/modal + form |
| `<feature>-update.tsx` | Update drawer/modal + form |
| `<feature>-table-actions-*.tsx` | Per-row action buttons |
| `use-<feature>-table-store.ts` | Zustand store for table state |
| `use-<feature>-update-store.ts` | Zustand store for update drawer state |

Rules:
- **Declaration style**: Always use `export function Foo({}: Props) {}` (named function declaration with `export` inline). Do NOT use `const Foo: FC<Props> = () => ...`. Do NOT declare the function without `export` and then add a separate `export { Foo }` at the bottom of the file.
- **forwardRef exception**: For ref-exposed components, use `export const Foo = forwardRef<RefFoo, Props>(function Foo({ ... }, ref) { ... })`.
- **Inner component props**: For non-exported (inner) components, do **not** define a separate `interface`. Inline the prop type directly in the function signature. `function PasswordField({}: { label: string }) {}`. Never write `interface PasswordFieldProps {}` for inner components.
- **Inner component placement**: All non-exported (inner) components must live in the **same file** as the exported component, placed below the exported component and its `displayName`.
- Row data type: `type RowType = Partial<GetApiListXxxResp200['data'][0]>`.
- Imperative reset APIs use `useRef<ComponentRef>` + a `setResetAllData` method.
- **Return parentheses**: Single-line `return` statements must always be wrapped in parentheses: `return (<div />)`. Never omit the parentheses, even for `return (null)`.
- **displayName**: Every exported component must have a `displayName` assignment immediately after the function declaration:
  ```tsx
  export function SuperDomainTable({}: Props) { ... }
  SuperDomainTable.displayName = 'SuperDomainTable' // -----------------------------<< Component >>-----------------------------
  ```
- **Export name ↔ file name consistency**: Runtime component export names and `displayName` values must match the file name converted to PascalCase. Example: `merchant-table.tsx` → `MerchantTable`, `users-index.tsx` → `UsersIndex`, `merchant-table-actions-delete.tsx` → `MerchantTableActionsDelete`, `page.tsx` → `Page`.

forwardRef template:

```tsx
interface Props {
  onClose: () => void
}

interface RefMerchantCreate {
  setResetAllData: () => void
}

export const MerchantCreate = forwardRef<RefMerchantCreate, Props>(
  function MerchantCreate({ onClose }, ref) {
    useImperativeHandle(ref, () => ({
      setResetAllData,
    }))

    function setResetAllData() {}

    return (<div />)
  },
)
MerchantCreate.displayName = 'MerchantCreate' // -----------------------------<< Component >>-----------------------------
```

#### File-level Ordering

Within a single `.tsx` file, declarations must appear in this order — the exported component, its `Props` interface, and its `Ref` interface stay at the **top**; all supporting code goes **below**:

1. `interface Props` — the component's prop type (if any)
2. `export interface Ref` — the component's imperative ref type (e.g. `RefAccountCreate`), if any
3. `export function` / `export default function` — the one exported component
4. Inner components — non-exported sub-components used by the main component (use inline prop types, **no separate interface**)
5. Other functions / inner functions — helpers used by the component
6. Other variables / inner variables — constants and derived values defined at module scope
7. Other types, interfaces / inner types, interfaces — any remaining type aliases or interfaces

```tsx
// ✅ correct file-level order
interface Props {
  onClose: () => void
}

export interface RefMerchantCard {
  setResetAllData: () => void
}

export function MerchantCard({ onClose }: Props) {
  // ...component body
}
MerchantCard.displayName = 'MerchantCard' // -----------------------------<< Component >>-----------------------------

// ✅ inner component — inline prop type, no separate interface
function PasswordField({}: { label: string; value: string }) {
  return (<input />)
}

// ❌ wrong — do not write a separate interface for inner components
// interface PasswordFieldProps { label: string }
// function PasswordField({}: PasswordFieldProps) {}

function formatName(raw: string) {
  return raw.trim()
}

const DEFAULT_LABEL = 'Unknown'

type Status = 'active' | 'inactive'
```

#### Component Internal Ordering

All variables, functions, and hooks inside a component must follow this order:

```tsx
export function ComponentA({}: Props) {
  // services — external hooks, APIs, message, store
  const [messageApi, contextHolder] = message.useMessage()
  const {} = useFeatureTableStore()

  // variable — derived / computed values
  const isEnableB = true

  // status — React state
  const [canSelectB, setCanSelectB] = useState<boolean>(false)

  // on function — DOM event handlers (on prefix, arrow function)
  const onClick = () => {}
  const onNameChange = () => {}

  // set get function — imperative helpers (set / get prefix, function declaration)
  function setClear() {}
  function getNewValue() {}

  // hook — useEffect and other side-effect hooks
  useEffect(() => {}, [])

  // useImperativeHandle
  useImperativeHandle(ref, () => ({
  }))

  return (<></>)
}
```

### Component Splitting Rules

The **Component Structure** table above lists *what* files a feature contains. This section defines *when* a component earns its own file, and when extraction is the wrong move.

#### Goals

- **Readability** — one file, one obvious purpose.
- **Testability** — each component carries a single responsibility, so props in and events out can be verified in isolation.
- **Low coupling** — UI, data fetching, form validation, and state coordination do not all live in one place.
- **Lower regression risk** — changing A should not silently break B.

#### Split when ANY of these apply

| Trigger | Threshold |
|---|---|
| File length | > 250 lines and still growing |
| `return` JSX block | > 120 lines, or conditional / JSX nesting depth > 3 |
| Props | > 8, or the same prop is drilled through 2+ intermediate components |
| Repeated JSX block | The same block appears 2+ times in the same feature |
| `useEffect` | 3+ effects **and** complex inter-dependencies between them |
| Event handlers | 8+ handlers **and** they no longer map cleanly to a single screen region |

#### Do NOT split when

- The candidate is a trivial 20–40 line JSX block — the jump cost to a new file outweighs the readability gain.
- The candidate is rendered by exactly one parent and isolates no logic. Keep it as an inner component in the same file (see **File-level Ordering** above).
- The motivation is "make the folder look fuller" — file count is not a quality metric.
- It is premature reuse abstraction. Names like `GenericPanel`, `CommonCard2`, `BaseWrapper` are a smell — wait for the third concrete use before extracting.

#### Layered split (cross-reference)

When extraction is justified, follow the layer boundaries already documented above — do not invent new ones:

| Layer | See |
|---|---|
| Route (server-only work) | **Page ↔ Index Pairing** |
| Orchestrator (`<feature>-index.tsx`) | **Page ↔ Index Pairing** + **Component Structure** |
| Section files (`-table`, `-filter`, `-create`, `-update`, `-table-actions-*`) | **Component Structure** |
| Reusable primitives | **Shared Components** |
| Feature-only sub-components used once | inner components in the same file (**File-level Ordering**) |
| State | **State Management (Zustand)** — the store does not render; the component does not own state shape |
| Data | **API Layer** — fetch in `use-api.ts`, hook in `use-react-query.ts`. Never scatter fetch logic into component files. |

#### Props & data flow

- Pass the **minimum** data a child needs; never spread an entire row/object when 1–2 fields suffice.
- 2+ levels of prop drilling is a smell — promote shared state to a Zustand store, or reshape the data at an intermediate layer before passing it down.
- Mutation `onSuccess` / `onError` callbacks belong at the hook wrapper or the orchestrator (mirroring the `setSuccess` / `setError` callback pattern in **API Layer**). Do not re-declare the same handler in every descendant.

#### Hooks & side effects

- One responsibility per `useEffect`. If an effect both syncs URL params *and* refetches *and* shows a toast, split it.
- Do **not** silence `react-hooks/exhaustive-deps` with `eslint-disable`. Promote the missing dependency, wrap with `useCallback`, or extract a pure function — fix the cause.
- Listeners (DOM events, `window`, `IntersectionObserver`, etc.) must register and clean up as a pair in the same effect. Never leave a stray cleanup or a stray subscription.
- Push complex orchestration into a custom hook (`use-<feature>-...-store.ts` for state, or a behavior hook). UI components should read like an assembly of named pieces, not a 300-line procedure.

#### Testability

- Every split sub-component must be testable in isolation — its surface is the typed props in and the typed events out.
- Business rules live in pure functions or hooks, not buried inside JSX expressions. Anything more complex than `value ? a : b` should earn a name.
- Row actions (`<feature>-table-actions-update.tsx`, `<feature>-table-actions-delete.tsx`) are the smallest testable units — keep them independently mountable.

### Shared Components (`components/shared/`)

Prefer these over custom implementations:

- **Tables**: `KTable`, `TableOperationLayout`, `TableOperationColumnLayout`, `TableLoadingStatus`
- **Modals / Drawers**: `KModal`, `KDrawer`, `KModalCreate`, `KModalCreateData`, `KDrawerCreateData`, `KModalUpdateData`
- **Buttons**: `CreateBtn`, `UpdateBtn`, `DeleteBtn`, `FilterBtn`, `ResetBtn`, `SearchBtn`, `SubmitBtn`, `DownloadBtn`, `ActionDeleteBtn`, `ActionUpdateBtn`
- **Forms**: `FormField`, `FormSelect`, `FormSwitch`, `FormTextarea`, `FormDatePicker`, `FormNumberField`, `FormLabel`, `FormErrorMsg`
- **Layout**: `CreateLayout`, `DelayLoadComponent`, `VisibilityChangeRender`
- **Misc**: `CopyText`, `ApiErrorMsg`, `KQuestion`

---

## Coding Conventions

### Formatting (Biome)

- **Indent**: 2 spaces
- **Quotes**: Single `'`
- **Semicolons**: `asNeeded` — omit trailing semicolons
- **Trailing commas**: `all`
- **Arrow parens**: `always`
- **Type-only imports**: follow Biome auto-fix output. Prefer `import type { Foo }`; if Biome rewrites to `import { type Foo }`, treat that as valid.
- **Class sorting**: Biome `useSortedClasses` applies to `className`, `cn`, `cva`, `clsx`, `tw`
- **Import order**: auto-sorted by Biome assist

### TypeScript

- Prefer `interface` for object shapes, `type` for aliases and unions.
- Use `satisfies` where type narrowing is needed without widening.
- Avoid `any`; use `unknown` + type guard when type is truly unknown.
- Non-null assertion (`!`) is a warning — avoid when possible.

### Control Flow Braces

All control flow statements (`if`, `else`, `else if`, `for`, `while`, `do`) **must** use braces, even when the body is a single statement. No single-line bodies without braces.

```ts
// ❌ wrong — single-line body without braces
if (page) _searchParams.append('page', `${page}`)
if (!open) return
if (e.key === 'Enter') onSearch()

// ✅ correct — always wrap the body in braces
if (page) {
  _searchParams.append('page', `${page}`)
}
if (!open) {
  return
}
if (e.key === 'Enter') {
  onSearch()
}
```

### Naming

| Entity | Convention | Example |
|---|---|---|
| Components | PascalCase | `MerchantTable` |
| Hooks | camelCase + `use` prefix | `useAntTable` |
| Stores | camelCase + `use...Store` | `useMerchantTableStore` |
| Query keys | `UPPER_SNAKE_CASE` const | `QUERY_KEY_API_LIST_MERCHANT` |
| API types | `GetXxxParams`, `GetXxxResp200` | `GetApiListMerchantParams` |
| Files | kebab-case | `merchant-table.tsx` |
| Runtime component export | PascalCase and must match file name (kebab-case → PascalCase) | `merchant-table.tsx` → `MerchantTable`, `page.tsx` → `Page` |

### Variable Naming by Type

Append a type suffix to camelCase variable names so the type is immediately visible at the usage site:

| Type | Suffix | Example |
|---|---|---|
| `string` | `S` | `merchantNameS` |
| `boolean` | `B` | `isVisibleB` |
| `number` | `N` | `totalCountN` |
| `object` | `O` | `totalCountO` |
| `string[]` | `ArS` | `selectedIdsArS` |
| `number[]` | `ArN` | `pageListArN` |
| `object[]` | `ArO` | `pageListArO` |

### Defensive Variable Access and Defaults

When consuming API responses, optional props, or user input, always add defensive guards for missing values:

- Use optional chaining (`?.`) for nested access that may be undefined.
- Prefer nullish coalescing (`??`) for defaults when only `null`/`undefined` should fallback.
- Use logical OR (`||`) only when all falsy values (`''`, `0`, `false`, `NaN`) should fallback.
- Always provide type-safe defaults for each suffix type (`S`, `N`, `B`, `O`, `ArS`, `ArN`, `ArO`).

```ts
const merchantNameS = apiDataO?.merchantName ?? ''
const totalCountN = apiDataO?.totalCount ?? 0
const isEnabledB = apiDataO?.isEnabled ?? false
const tagsArS = apiDataO?.tags ?? []
const personNameS = personO?.profileO?.nameS ?? ''

// Use || only when empty/falsy values are intentionally treated as missing
const displayNameS = nicknameS || 'Anonymous'
```

### React Query Destructured Naming

When destructuring React Query hook results, rename each property using the pattern `<property><hookName>` in camelCase:

```ts
// GET hook — rename data, refetch, etc.
const {
  data: dataApiGetApiV3OriginGroupsAll,
  refetch: refetchApiGetApiV3OriginGroupsAll,
} = apiGetApiV3OriginGroupsAll({})

// Mutation hook — rename mutate, isPending, etc.
const {
  mutate: mutateApiPostApiV3LaunchBulk,
  isPending: isPendingApiPostApiV3LaunchBulk,
  isPaused: isPausedApiPostApiV3LaunchBulk,
} = apiPostApiV3LaunchBulk()
```

Pattern: `<property>` + `<HookName>` → camelCase. Examples: `data` + `apiGetXxx` → `dataApiGetXxx`, `mutate` + `apiPostXxx` → `mutateApiPostXxx`.

### Function Naming by Purpose

| Purpose | Prefix | Style | Example |
|---|---|---|---|
| Set / write data (state setter, mutator) | `set` | `function setXx() {}` | `function setCurrentPage() {}` |
| Get / read data (derived value, accessor) | `get` | `function getXx() {}` | `function getFilterParams() {}` |
| DOM event handler (`onChange`, `onClick`, …) | `on` | `const onXx = () => {}` | `const onSearchClick = () => {}` |

### Inline vs Extracted Event Handlers

Decide per handler whether the callback may stay inline in JSX or must be extracted into a named `const onXx = () => {}` (placed in the `// on function` block — see **Component Internal Ordering**).

| Situation | Rule |
|---|---|
| Body is 1–2 lines **and** has no/minimal branching or state reads | Inline is acceptable — e.g. `onClick={() => setIsOpenB(true)}` |
| Body has a conditional, an early `return`, 2+ statements, or non-trivial logic | Extract into a named `const onXx = () => {}` handler |

- **Do NOT wrap extracted handlers in `useCallback`.** It is not a project convention and adds no value here — a plain `const onXx = () => {}` is correct. Only reach for `useCallback` when a real, demonstrated need exists (e.g. a memoized child or an effect dependency that actually re-runs), not by default.

```tsx
// ✅ inline — trivial, single statement, no branching
<Button onClick={() => setIsInboundAddOpenB(true)}>新增</Button>

// ❌ inline — has a guard + early return + 2 statements
<Button
  onClick={() => {
    if (lineTagIdN === undefined) {
      return
    }
    setIsInboundAddOpenB(true)
  }}
>
  新增 Inbound
</Button>

// ✅ extracted — named on-handler, no useCallback
const onInboundAddClick = () => {
  if (lineTagIdN === undefined) {
    return
  }
  setIsInboundAddOpenB(true)
}

<Button onClick={onInboundAddClick}>新增 Inbound</Button>
```

### Paths

- Use `@/` alias for absolute imports (maps to workspace root).
- Do NOT use relative `../` imports when `@/` works.

---

## Internationalization

- Two locales: `en` (default) and `zh-TW`.
- Translation files: `public/locales/en.json`, `public/locales/zh-TW.json`.
- Use `useTranslation()` hook; key format follows feature namespacing.
- `interpolation.escapeValue: false` — React handles XSS escaping.

---

## Testing

- Runner: Vitest 3 with `jsdom` environment.
- Test files: co-located with source or under `__tests__/`.
- Import aliases `@/` work in tests via `vite-tsconfig-paths`.
- Use `@testing-library/react` for component tests.
- E2E: Playwright.

---

## Rule Priority

When two rules conflict, apply this priority:

1. Biome / TypeScript compile correctness
2. Runtime behavior correctness
3. AGENTS.md style conventions

---

## Important Notes for Agents

1. **No semicolons** — Biome enforces `asNeeded`. Do not add trailing semicolons.
2. **Single quotes** — Always use `'` for strings (not `"`).
3. **Type-only imports** — Use the format Biome outputs after auto-fix (`import type` or `import { type ... }` are both acceptable if formatter-generated).
4. **Mutations take callbacks** — Pass `setSuccess` / `setError` as arguments to mutation hooks, not inline.
5. **Zustand state** — Use `setState` directly; do not put setter methods in the store definition.
6. **Do not create new API utilities** — All fetch logic belongs in `use-api.ts`; all hook wrappers belong in `use-react-query.ts`.
7. **Use shared components** — Before building a button, modal, drawer, or form field, check `components/shared/` first.
8. **Chinese/CJK text** — Files with Chinese characters must be saved as UTF-8 (no BOM). When editing via terminal, use `[System.IO.File]::WriteAllText` with explicit UTF-8 encoding.
9. **Pagination defaults** — Use `PAGINATION_CURRENT` and `PAGINATION_PAGE_SIZE` from `components/ant/use-ant-table.ts`, not hardcoded numbers.
10. **Prefer Zod for validation** — When adding numeric checks, schema validation, or form validation, prefer Zod as the first choice over ad-hoc conditionals or custom validators unless an existing module already requires a different validation mechanism.
11. **One runtime component export per `.tsx` file** — Each `.tsx` file should export only one runtime React component (`export` or `export default`). Type exports (e.g. `export type`, `export interface`) do not count toward this limit.
12. **Split by signal, not by length alone** — Extract a sub-component when a file passes 250 lines, the `return` block exceeds 120 lines, the same JSX repeats 2+ times in a feature, or a prop drills through 2+ intermediate components. Do not extract trivial 20–40 line blocks used in a single place. See **Component Splitting Rules** for the full trigger table and anti-patterns.
13. **Defensive variable access is required** — For uncertain/optional data, guard with `?.` and default with `??` (or `||` only when falsy fallback is intentional). Avoid assuming deep properties always exist.
14. **Inline `export` on function declarations** — Write `export function Foo(...)` directly. Never split into `function Foo(...)` + a trailing `export { Foo }` at the bottom of the file.
