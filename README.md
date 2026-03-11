# TileMaster Beta (New GUI)

https://mesutschwarz.github.io/TileMasterBeta/

TileMaster Beta is a modern, browser-based pixel tile and tilemap editor focused on retro workflows.

It combines a fast tile editor, layered map builder, platform-aware validation, and export tooling for Game Boy-style pipelines (including GBDK), while keeping a polished desktop-like UI.

---

## Highlights

- Dual workflow: **Tile editing** + **Map building** in one workspace
- Multi-layer maps: **tile**, **collision**, and **object** layers
- Retro platform targets with constraints: **GB, GBC, NES, SMS, Game Gear**
- Powerful drawing tools: pencil, eraser, fill, picker, line, rectangle, circle, selection
- Drag/drop tile organization with duplicate cleanup + usage-based reordering
- Import pipeline:
  - PNG image → deduplicated tiles + auto-generated map
  - `.c` / `.h` code import (GBDK-style tile arrays)
- Export pipeline:
  - GBDK `.c`, `.h`, `.bin`
  - PNG tileset or rendered map image
- Real-time validation + status indicators
- Undo/redo history with labeled actions
- Resizable, docked editor interface with draggable toolbars
- Theme switching and grid/appearance settings

---

## Core Feature Breakdown

## 1) Tile Editor

The tile editor is optimized for pixel-level work:

- Per-tile canvas editing with configurable zoom and pan
- Tools:
  - `Pencil`, `Eraser`, `Flood Fill`, `Color Picker`
  - `Line`, `Rectangle`, `Circle`
  - `Selection` with move/cut/copy/paste behavior
- Brush controls:
  - Brush size (1–16)
  - Square/circle brush shapes
- Tile transforms:
  - Rotate clockwise
  - Flip horizontal / vertical
- Tile operations in explorer:
  - Create, duplicate, rename, clear, delete
  - Cut/copy/paste tile content
  - Reorder tiles by drag-and-drop

## 2) Map Builder

The map editor supports full map composition on top of your tileset:

- Map creation, rename, delete, resize
- Layered editing model:
  - **Tile layer**: places tile indices
  - **Collision layer**: passable/solid values
  - **Object layer**: object marker indices
- Per-layer controls:
  - Visibility toggle
  - Lock/unlock
  - Active layer selection
- Same drawing stack as tile editor (including shape and selection tools)
- Selection clipboard is layer-type aware (prevents invalid paste across layer types)

## 3) Import Workflows

### PNG import

- Reads source image and slices it into platform tile dimensions
- Quantizes pixels to current platform palette
- Optional Floyd–Steinberg dithering
- Deduplicates identical tiles while generating map data
- Inserts a blank tile at index `0` for empty/transparent regions
- Optional cleanup pass after import (merge identical tiles + reorder by usage)

### C/H code import

- Accepts `.c` and `.h` files
- Parses `const unsigned char ...[] = { ... }` arrays
- Decodes GBDK 2bpp planar tile bytes back into tile pixel data
- Skips map arrays when importing code tiles

## 4) Export Workflows

### GBDK export

- **`.c` source** with tiles + map layer arrays
- **`.h` header** with declarations and dimension macros
- **`.bin`** raw tile binary data
- Export options:
  - Project/asset name
  - Include comments
  - Export all layers or primary layer only
  - Optional ROM bank annotation (`BANK(n)`)

### PNG export

- Export full tileset atlas
- Export rendered map image (visible tile layers)

## 5) Validation and Health

Constraint validation runs against current platform rules:

- Tileset size over target maximum (error/warning thresholds)
- Tile dimension mismatches
- Excess color usage per tile vs platform bit depth
- Map dimensions exceeding platform standard viewport

Validation summaries are surfaced in the status area for continuous feedback.

## 6) UI / UX System

- Desktop-style shell with:
  - Header actions (theme, import/export, platform target)
  - Activity bar (Tile/Map explorer switch)
  - Explorer sidebar
  - Docked editors for tile and map
  - Status bar with project counters + history info
- Dockable/floatable toolbars for drawing tools and palette
- Onboarding modal for first-time users
- Settings modal for tile grid, map grid, and appearance/theme controls

---

## Supported Target Platforms

| Platform | Tile Size | Bit Depth | Max Tiles | Default Map Size |
|---|---:|---:|---:|---:|
| Game Boy | 8×8 | 2bpp | 256 | 32×32 |
| Game Boy Color | 8×8 | 2bpp | 512 | 32×32 |
| NES | 8×8 | 2bpp | 256 | 32×30 |
| Sega Master System | 8×8 | 4bpp | 448 | 32×28 |
| Game Gear | 8×8 | 4bpp | 448 | 32×28 |

---

## Keyboard Shortcuts

### Global

- `Ctrl/Cmd + Z` — Undo
- `Ctrl/Cmd + Shift + Z` — Redo
- `T` — Switch to tile view
- `V` — Switch to map view
- `#` — Toggle grid (tile or map, depending on active view)
- `+` / `-` — Brush size up/down
- `K` — Toggle brush shape (square/circle)
- `Delete` / `Backspace` — Clear active tile or active map layer
- `1..8` — Select palette index

### Tool Selection

- `P` — Pencil
- `E` — Eraser
- `G` — Fill
- `I` — Picker
- `L` — Line
- `B` — Rectangle
- `O` — Circle
- `S` — Select

### Tile view transforms

- `R` — Rotate tile clockwise
- `H` — Flip tile horizontally
- `J` — Flip tile vertically

### Canvas interactions

- Mouse wheel — Zoom
- Middle mouse or `Shift + drag` — Pan canvas
- `F` (map canvas) — Fit to window
- `Esc` — Clear active selection
- `Ctrl/Cmd + C/X/V` — Copy/cut/paste selection

---

## Tech Stack

- **React 18** + **TypeScript**
- **Vite**
- **Zustand** (state)
- **Tailwind CSS** + custom CSS variable theming
- **Dockview React** (docked editor panels)
- **react-resizable-panels** (main layout resizing)
- **@use-gesture/react** (canvas interactions)
- **Lucide React** (icons)

---

## Project Structure (high level)

- `src/components` — UI modules (editors, explorers, dialogs, layout)
- `src/stores` — Zustand state (`editorStore`, `projectStore`)
- `src/core/platforms` — platform specs and limits
- `src/core/validation` — constraint engine
- `src/utils` — import logic, drawing algorithms, helpers
- `src/exporters` — GBDK and PNG export modules
- `src/theme` — theme registry and runtime theme application
- `src/types` — domain types (`tile`, `map`, `platform`)

---

## Documentation

- User guide: [docs/user-guide.md](docs/user-guide.md)
- Developer guide: [docs/developer-guide.md](docs/developer-guide.md)

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Install

```bash
npm install
```

### Run development server

```bash
npm run dev
```

### Build production bundle

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

---

## Current Scope Notes

- The app currently focuses on **editing, validation, and import/export pipelines**.
- History is maintained in memory with undo/redo snapshots.
- There is no dedicated full-project file persistence format wired into the UI yet.

---

## License

No license file is currently defined in this repository. Add one if distribution terms are needed.
