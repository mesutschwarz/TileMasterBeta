# TileMaster User Guide

This guide is for artists, level designers, and game developers using TileMaster to create tilesets and maps.

## 1. What TileMaster Does

TileMaster is a browser-based editor for retro game pipelines.

You can:
- Create and edit pixel tiles
- Build layered tilemaps
- Validate content against platform limits
- Import from PNG or C/H tile arrays
- Export to GBDK and PNG

## 2. Interface Overview

Main areas:
- **Header**: platform target, import/export, settings, theme actions
- **Activity Bar**: switch between **Tiles** and **Maps** views
- **Explorer Panel**: tile list, map list, and item operations
- **Canvas Area**: tile editor or map canvas (depends on current view)
- **Toolbars**: drawing tools, palette tools, and editor actions
- **Status Bar**: project and validation state

## 3. Quick Start Workflow

1. Select your target platform in the header.
2. Create tiles (or import from PNG/C/H).
3. Build one or more maps in map view.
4. Use validation feedback to resolve limit issues.
5. Export assets to GBDK/PNG.

## 4. Working with Tiles

In tile view, you can:
- Draw directly on tile pixels
- Rename, duplicate, or delete tiles
- Reorder tiles in the explorer
- Rotate and flip tiles
- Use selection copy/cut/paste

Typical tile tools:
- Pencil
- Eraser
- Fill
- Picker
- Line
- Rectangle
- Circle
- Selection

## 5. Working with Maps

In map view, you can:
- Create and resize maps
- Place tiles into map cells
- Edit multiple layers:
  - Tile layer
  - Collision layer
  - Object layer
- Lock/hide layers while editing
- Use map drawing and selection tools

## 6. Importing

### PNG Import
Use this when you have a sprite sheet or source image.

Pipeline behavior:
- Slices image into platform tile size
- Quantizes colors to target constraints
- Optionally applies dithering
- Deduplicates identical tiles
- Builds map data from discovered tile indices

### C/H Import
Use this for existing code assets (GBDK-style arrays).

Pipeline behavior:
- Reads tile arrays in C/H sources
- Decodes compatible planar tile data
- Imports tiles into the current project

## 7. Exporting

### GBDK Export
Outputs:
- `.c` source
- `.h` header
- `.bin` tile data

You can choose naming/options from the export dialog.

### PNG Export
Outputs:
- Tileset atlas image
- Rendered map image (based on visible tile layers)

## 8. Validation and Limits

Validation checks run continuously for platform constraints, including:
- Tile count limits
- Tile dimension mismatches
- Color usage beyond bit-depth limits
- Oversized map dimensions

Resolve errors/warnings before final export for best runtime compatibility.

## 9. Keyboard Shortcuts

Global:
- `Ctrl/Cmd + Z`: Undo
- `Ctrl/Cmd + Shift + Z`: Redo
- `Ctrl/Cmd + ,`: Open settings
- `T`: Switch to tile view
- `V`: Switch to map view
- `#`: Toggle grid (context-aware)
- `+` / `-`: Brush size up/down
- `K`: Toggle brush shape
- `Delete` / `Backspace`: Clear current tile or active map layer
- `1..8`: Select palette color index

Tool selection:
- `P`: Pencil
- `E`: Eraser
- `G`: Fill
- `I`: Picker
- `L`: Line
- `B`: Rectangle
- `O`: Circle
- `S`: Selection

Tile transforms:
- `R`: Rotate clockwise
- `H`: Flip horizontal
- `J`: Flip vertical

Canvas and selection:
- Mouse wheel: Zoom
- Middle mouse or `Shift + Drag`: Pan
- `Esc`: Clear active selection
- `Ctrl/Cmd + C/X/V`: Copy/Cut/Paste selection

## 10. Tips

- Keep tile `0` as a blank tile for predictable empty cells.
- Pick the platform target early to avoid rework.
- Use validation as you edit, not only at export time.
- In map projects, lock layers you are not actively editing.

## 11. Troubleshooting

- **Import looks wrong**: verify source tile size and platform target.
- **Exported assets too large**: reduce tile count or map size.
- **Colors look incorrect**: check palette assumptions and target bit depth.
- **Shortcuts not firing**: click the editor first to ensure canvas focus.
