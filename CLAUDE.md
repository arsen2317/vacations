# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

This is a frontend prototype for an internal "vacation management" service (сервис отпусков) — a redesign mockup, not a production app. There is no backend; all data comes from `src/data/mockData.js` and is held in React state via context. See `vacation-service-spec.md` for the product spec (entities, roles, statuses, business rules) that the UI is modeling.

## Commands

- `npm run dev` — start Vite dev server with HMR
- `npm run build` — production build
- `npm run lint` — run ESLint over the project
- `npm run preview` — preview the production build

There is no test suite configured.

## Stack

React 19 + Vite, Tailwind CSS v4 (via `@tailwindcss/vite`), Ant Design (`antd` v6, `@ant-design/icons`), `dayjs` for dates.

## Design system rules (critical)

- `src/ds/` is the project's design system (DS, "ДС МТС"). **Never create new components or fork/customize existing ones.** Always look for an existing DS component first (`src/ds/index.js` is the barrel export — check it before assuming something doesn't exist).
- Ant Design (`antd`) is a legacy dependency from the project's first stage — it is being progressively phased out in favor of `src/ds/`. Don't introduce new `antd` usages; when touching a page/component that still relies on `antd`, prefer migrating it to the equivalent `src/ds/` component if one exists.
- DS exposes: `Banner`, `StatusBadge`, `Tag`, `Chip`, `PersonAvatar`, `SelectField`, `CalendarRange`, `Tabs`, `Header`, plus shared tokens (`COLORS`, `BTN_STYLE`, `FONT_CSS`) and icons (`LockIcon`, `SelectChevron`, `InfoIcon`, `CloseCircleIcon`, `SearchIcon`, `ChevronUp`, `ChevronDown`, `BreadChevron`).
- **Never invent or customize icons.** All needed icons already exist in `src/ds/icons.jsx`. If a needed icon is genuinely missing, stop and ask for the SVG rather than approximating one.
- Styling is done with inline `style` objects using `COLORS` from `src/ds/tokens.js` and the custom fonts `'MTSWide'` (headings/buttons, see `BTN_STYLE`) and `'MTSCompact'` (body), declared in `src/ds/fonts.js`.
- Responsive behavior is driven by `useIsDocked()` (breakpoint at 1720px) — when docked, the layout shifts to a left sidebar (`marginLeft: 280`); otherwise it's centered with `maxWidth: 1440`. Reuse this hook rather than adding new breakpoint logic.

## Mock data rules (critical)

- `src/data/mockData.js` is the single source of truth for prototype content (current user, campaign, requests, subordinates, balances, etc.). **Never alter its shape/values to make a feature "work"** — if a UI requirement conflicts with the existing mock data, stop and ask how to resolve it rather than changing the data yourself.

## Architecture

- **Entry/composition**: `main.jsx` → `App.jsx`. `App` wraps everything in `PasswordGate` (prototype access gate) and `AppProvider` (global state), then renders `Header`, the page title, `TabNav`, and the active page based on `activeTab`.
- **Global state**: `src/context/AppContext.jsx` is a single React context (`useApp()`) holding role, active tab, campaign/segment/plan state, requests, subordinates, and balances — all seeded from `mockData.js`. There's no reducer/store; just `useState` pairs exposed through context.
- **Roles drive visibility**: `role` is one of `'employee' | 'manager' | 'hr_admin'`. Tabs/pages such as `ManagerPage` and `HRAdminPage` are conditionally rendered in `App.jsx` based on role — follow this pattern when adding role-gated UI.
- **Pages** (`src/pages/`) compose feature components and DS components for each tab (`EmployeeDashboard`, `PlanningPage`, `ColleaguesPage`/`CalendarPage`, `ManagerPage`, `HRAdminPage`, `RequestsPage`).
- **Feature components** (`src/components/`) are prototype-specific (not DS): things like `RequestsTable`, `NewRequestModal`/`RequestModal`, `BalanceCard`, `CampaignBanner`, `VacationWidget`, `TopBar`, `TabNav`, `StatusBadge`. When building new UI, prefer composing these and DS components over writing new low-level pieces.
- **Date handling**: use `src/utils/dateUtils.js` and `dayjs` for formatting/range logic (mock dates are plain JS `Date` objects).
