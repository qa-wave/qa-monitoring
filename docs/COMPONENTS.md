# Components Reference

## Dashboard Components

Located in `src/components/dashboard/`.

### KpiCard

Key Performance Indicator card with status coloring, delta indicator, and optional icon.

**Props:**
| Prop | Type | Description |
|---|---|---|
| label | string | KPI label text |
| value | string | Displayed value |
| unit | string? | Unit suffix (e.g., "ms", "%") |
| delta | { value: string; direction: "up" \| "down" \| "flat"; positive?: boolean } | Change indicator |
| hint | string? | Subtitle text |
| icon | React.ElementType? | Lucide icon component |
| status | "ok" \| "warn" \| "down" \| "info" \| "muted" | Border color variant |

**Usage:**
```tsx
<KpiCard
  label="Uptime"
  value="99.97"
  unit="%"
  status="ok"
  delta={{ value: "+0.02 %", direction: "up", positive: true }}
  hint="vs last week"
  icon={Activity}
/>
```

**Used on:** Overview dashboard (`src/app/(dashboard)/page.tsx`)

---

### AnimatedNumber

Client-side component that counts up from 0 to a target value on mount with ease-out cubic animation.

**Props:**
| Prop | Type | Description |
|---|---|---|
| value | number | Target number to animate to |
| duration | number? | Animation duration in ms (default: 800) |
| decimals | number? | Decimal places (default: 0) |
| className | string? | CSS classes |

**Usage:**
```tsx
<AnimatedNumber value={99.97} decimals={2} className="font-mono text-3xl" />
```

**Used on:** Available for any page needing animated counters. Import from `@/components/dashboard/AnimatedNumber`.

---

### StatusMatrix

Grid showing application health across environments. Each cell is a colored dot linking to the detail page.

**Props:**
| Prop | Type | Description |
|---|---|---|
| applications | Application[] | List of applications |
| environments | Environment[] | List of environments |
| healthChecks | HealthCheck[] | Health check data |
| className | string? | CSS classes |

**Usage:**
```tsx
<StatusMatrix
  applications={data.applications}
  environments={data.allEnvironments}
  healthChecks={data.healthChecks}
/>
```

**Used on:** Overview dashboard

---

### DoraCard

Displays the four DORA metrics (Deployment Frequency, Lead Time for Changes, Change Failure Rate, Mean Time to Recovery) with rating badges (Elite/High/Medium/Low).

**Props:**
| Prop | Type | Description |
|---|---|---|
| data | DoraMetrics | Computed DORA metrics object |

**Usage:**
```tsx
<DoraCard data={computeDoraMetrics()} />
```

**Used on:** Overview dashboard (when persona includes "dora" widget)

---

### DeployHeatmap

GitHub-style contribution heatmap showing deployment activity over time. Color-coded by success/failure ratio.

**Props:**
| Prop | Type | Description |
|---|---|---|
| deployments | Deployment[] | Deployment history |
| locale | "cs" \| "en"? | Locale for date formatting |

**Usage:**
```tsx
<DeployHeatmap deployments={deployments} locale="cs" />
```

**Used on:** Overview dashboard

---

### ServiceMap

Radial SVG visualization showing application dependencies and their health status. Uses data from `applications` and `healthChecks` fixtures directly (client component).

**Props:** None (reads data from imports)

**Usage:**
```tsx
<ServiceMap />
```

**Used on:** Overview dashboard

---

### AreaChart

Interactive SVG area chart with hover tooltip showing values. Renders a filled area below the line.

**Props:**
| Prop | Type | Description |
|---|---|---|
| data | { label: string; value: number }[] | Data points |
| height | number? | Chart height in px (default: 160) |
| color | string? | Line/fill color (default: brand-primary) |
| unit | string? | Unit for tooltip |
| ariaLabel | string? | Accessible label |

**Usage:**
```tsx
<AreaChart
  data={[{ label: "Mon", value: 42 }, { label: "Tue", value: 58 }]}
  color="hsl(var(--status-ok))"
  unit="ms"
/>
```

**Used on:** Application detail, various metric pages

---

### Sparkline

Minimal inline SVG trend line with optional fill. No axes or labels.

**Props:**
| Prop | Type | Description |
|---|---|---|
| points | number[] | Y-values |
| width | number? | SVG width (default: 120) |
| height | number? | SVG height (default: 32) |
| color | string? | Stroke/fill color |
| fill | boolean? | Show filled area (default: true) |
| ariaLabel | string? | Accessible label |

**Usage:**
```tsx
<Sparkline
  points={[91, 92, 94, 93, 95, 96, 97]}
  color="hsl(var(--status-ok))"
  ariaLabel="Pass rate trend"
/>
```

**Used on:** Overview dashboard (test pass rate), various cards

---

### IncidentTimeline

Vertical timeline showing incident updates with timestamps and authors.

**Props:**
| Prop | Type | Description |
|---|---|---|
| updates | { at: string; author: string; message: string }[] | Timeline entries |
| startedAt | string | Incident start time |
| resolvedAt | string \| null | Resolution time |

**Usage:**
```tsx
<IncidentTimeline
  updates={incident.updates}
  startedAt={incident.startedAt}
  resolvedAt={incident.resolvedAt}
/>
```

**Used on:** Incident detail page (`src/app/(dashboard)/incidents/[id]/page.tsx`)

---

### DashboardGrid

Client-side drag-and-drop grid for reordering dashboard widgets. Persists order to localStorage.

**Props:**
| Prop | Type | Description |
|---|---|---|
| children | React.ReactNode[] | Widget sections to render |
| storageKey | string? | localStorage key (default: "zornik-widget-order") |

**Usage:**
```tsx
<DashboardGrid>{sections}</DashboardGrid>
```

**Used on:** Overview dashboard (via `DashboardLayout`)

---

### PageHeader

Page title with optional description. Used at the top of every dashboard page.

**Props:**
| Prop | Type | Description |
|---|---|---|
| title | string | Page title |
| description | string? | Subtitle |

---

### IncidentBanner

Alert banner for active critical incidents. Displayed at the top of the dashboard.

---

### PipelineDiagram

Visual representation of CI/CD pipeline stages and their status.

---

## Layout Components

Located in `src/components/layout/`.

### AppShell

Root layout wrapper. Composes Sidebar, Header, MobileBottomNav, CommandPalette, KeyboardShortcuts, OnboardingWizard, PageTransition, and ToastProvider.

**Props:**
| Prop | Type | Description |
|---|---|---|
| children | React.ReactNode | Page content |
| defaultPersona | PersonaKey | Active persona filter |
| user | { name, email, role } | Current user |
| brand | { productName, tenantName, style } | Brand config |
| locale | Locale | Current locale |
| navLabels | Translations["nav"] | Localized nav labels |

---

### CommandPalette

Cmd+K / Ctrl+K command palette with fuzzy search across pages, applications, and actions.

**Props:**
| Prop | Type | Description |
|---|---|---|
| role | UserRole | Current user role (filters available commands) |

**Trigger:** `Cmd+K` or `Ctrl+K`

---

### ThemeSwitcher

Dropdown to switch between 10 visual themes. Applies CSS class to `<html>` element and toggles dark mode for dark themes.

**Props:**
| Prop | Type | Description |
|---|---|---|
| current | StyleKey | Currently active theme |

---

### LocaleSwitcher

Language toggle dropdown (Czech / English). Sets `zornik-locale` cookie and triggers `router.refresh()`.

**Props:**
| Prop | Type | Description |
|---|---|---|
| current | Locale | Currently active locale |

---

### SavedViews

Bookmark-style dropdown for saving and restoring URL search param combinations. Persists to localStorage.

**Props:** None

---

### PageTransition

Client-side fade-in animation wrapper. Triggers a brief opacity/translate transition on route change.

**Props:**
| Prop | Type | Description |
|---|---|---|
| children | React.ReactNode | Page content |

**Used in:** AppShell (wraps `<main>` content)

---

## UI Primitives

Located in `src/components/ui/`. Built on Radix UI + CVA (class-variance-authority).

### Toast System

Context-based toast notification system with three types: success, error, info. Auto-dismisses after 4 seconds. Supports optional title, description, and action button.

**API:**
```tsx
import { useToast } from "@/components/ui/toast";

function MyComponent() {
  const { toast } = useToast();

  // Simple (backwards-compatible)
  toast("success", "Changes saved.");
  toast("error", "Something went wrong.");

  // With title + description
  toast("success", "Integration is now active.", { title: "GitHub connected" });

  // With action button
  toast("info", "User was removed from the team.", {
    title: "User deleted",
    action: { label: "Undo", onClick: () => handleUndo() },
  });
}
```

**Provider:** `<ToastProvider>` wraps the app in `AppShell`.
