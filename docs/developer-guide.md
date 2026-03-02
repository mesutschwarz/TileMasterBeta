# TileMaster Developer Guide

This guide is for contributors extending TileMaster internals.

## 1. Stack and Runtime

- React 18 + TypeScript
- Vite build pipeline
- Zustand state stores
- Tailwind + CSS variables for theming
- Dockview and panel layout utilities for desktop-style UI

Core scripts:
- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run preview`

## 2. Project Structure

- `src/components`: UI surfaces and feature views
- `src/stores`: global application state
  - `editorStore.ts`: UI/editor state
  - `projectStore.ts`: project content and mutations
- `src/core/platforms`: platform definitions and constraints
- `src/core/validation`: validation engine
- `src/importers`: content ingestion entry points
- `src/exporters`: format exporters (GBDK/PNG)
- `src/theme`: theme registry and application layer
- `src/utils`: drawing algorithms, parsers, shared helpers
- `src/types`: domain models for tiles, maps, platforms

## 3. State Model

### `projectStore`
Owns durable project data and history-aware mutations:
- Tiles and map collections
- Active selection references (selected tile/map)
- Import/export-relevant asset data
- Undo/redo state transitions

### `editorStore`
Owns interaction/UI state:
- Current tool and current view (`tile` or `map`)
- Grid toggles and visibility options
- Brush shape/size and color index
- Modal visibility states (settings, onboarding)
- Active layer metadata

### Guidance
- Keep transient UI concerns in `editorStore`.
- Keep user-authored project content in `projectStore`.
- Avoid duplicating canonical data across both stores.

## 4. UI Architecture

Main shell is composed of:
- Header actions and global controls
- Activity bar view switch
- Explorer and side panels
- Tile and map canvas workspaces
- Status/health feedback surfaces

Important shared components:
- `Modal.tsx`: reusable modal shell (overlay, close controls, Escape handling)
- `SettingsModal.tsx`: runtime behavior and appearance controls
- `OnboardingModal.tsx`: first-use guidance entry point

## 5. Keyboard and Command Flow

Centralized keyboard handling lives in:
- `src/hooks/useKeyboardShortcuts.ts`

Expected behavior:
- Global undo/redo and settings actions
- View switching and tool selection
- Context-sensitive clear action
- Tile transforms only in tile view

When adding shortcuts:
1. Update command logic in shortcut hook.
2. Update visible shortcut hints in UI labels/tooltips.
3. Ensure inputs/textareas are excluded from destructive commands.

## 6. Drawing Pipeline

Drawing and shape helpers are in:
- `src/utils/drawingAlgorithms.ts`

Rules:
- Keep algorithms deterministic and side-effect free.
- Return explicit coordinate sets or pixel mutations.
- Validate bounds at mutation boundaries (store/action layer).

## 7. Import Pipeline

Key utility modules:
- `src/utils/pngImporter.ts`
- `src/utils/codeImporter.ts`

Import responsibilities:
- Decode source data
- Normalize to internal tile format
- Deduplicate where applicable
- Produce coherent tile/map payloads for store actions

Keep parser failures explicit and user-visible.

## 8. Export Pipeline

Current exporters:
- `src/exporters/gbdk/GbdkExporter.ts`
- `src/exporters/png/PngExporter.ts`

Exporter contract guidance:
- Inputs are internal normalized project models
- Output should be stable/reproducible for same input
- Guard against unsupported layer/data combinations

## 9. Validation System

Validation entry point:
- `src/core/validation/ConstraintEngine.ts`

Validation should:
- Be platform-aware
- Distinguish warning vs error severity
- Remain independent from rendering components
- Return structured diagnostics consumable by UI panels

## 10. Theme System

Theme internals:
- `src/theme/themeRegistry.ts`
- `src/theme/themeApplier.ts`

Theme model:
- Theme entries in `themeRegistry.ts` define semantic tokens
- Applier maps tokens to CSS variables on runtime root
- Components consume variables through utility classes/CSS

When adding a theme:
1. Add a new entry in `src/theme/themeRegistry.ts`.
2. Ensure the new theme appears in `themeEntries`.
3. Verify token coverage and fallback behavior in `src/theme/themeApplier.ts`.

## 11. Component Development Standards

- Keep feature logic in hooks/stores; components should stay presentational where practical.
- Reuse shared modal, tooltip, and panel primitives.
- Add ARIA attributes for interactive controls (menus, dialogs, toggles).
- Prefer keyboard-accessible patterns over hover-only interaction.

## 12. Error Handling and Safety

- Validate external data at import boundaries.
- Use narrow, explicit TypeScript types for parsed payloads.
- Avoid silent catches; surface actionable messages.
- Keep destructive actions reversible when possible (history integration).

## 13. Performance Notes

- Avoid unnecessary full-canvas redraws.
- Memoize derived lists used by explorers/toolbars.
- Keep store selectors granular to reduce React rerenders.
- For large builds, rely on Vite chunking strategy already configured in `vite.config.ts`.

## 14. Contribution Checklist

Before completing a change:
1. Run lint and fix introduced issues.
2. Run production build.
3. Verify shortcut hints match behavior.
4. Verify modal/menu actions work with mouse and keyboard.
5. Confirm no regressions in import/export flows you touched.

## 15. Known Scope Boundaries

- Project persistence format is not yet a full dedicated file format flow in current UI.
- Current focus is editing, validation, and import/export reliability.

Keep changes scoped and avoid introducing unrelated architectural churn.
