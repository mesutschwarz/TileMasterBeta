# TileMaster Alpha (Public Overview)

TileMaster Alpha is a modern, browser-based tile and tilemap editor for retro-style game workflows.

It helps artists and developers create tiles, assemble layered maps, validate against classic hardware constraints, and export assets in production-ready formats.

## Key Features

- Fast **tile editing** and **map building** in one app
- Layered maps: **tile**, **collision**, **object**
- Platform targets: **Game Boy, Game Boy Color, NES, Sega Master System, Game Gear**
- Rich editing tools: pencil, eraser, fill, picker, line, rectangle, circle, selection
- PNG and code import workflows
- Export to **GBDK `.c` / `.h` / `.bin`** and **PNG**
- Real-time validation and status indicators
- Undo/redo history
- Customizable themes and grid controls

## Typical Workflow

1. Create or import tiles.
2. Build maps with multiple layers.
3. Validate constraints for your target platform.
4. Export source/binary/image assets.

## Supported Platforms

| Platform | Tile Size | Bit Depth | Max Tiles | Default Map Size |
|---|---:|---:|---:|---:|
| Game Boy | 8×8 | 2bpp | 256 | 32×32 |
| Game Boy Color | 8×8 | 2bpp | 512 | 32×32 |
| NES | 8×8 | 2bpp | 256 | 32×30 |
| Sega Master System | 8×8 | 4bpp | 448 | 32×28 |
| Game Gear | 8×8 | 4bpp | 448 | 32×28 |

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Install

```bash
npm install
```

### Start development server

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview build

```bash
npm run preview
```

## Learn More

- User guide: [docs/user-guide.md](docs/user-guide.md)
- Developer guide: [docs/developer-guide.md](docs/developer-guide.md)

## License

No license file is currently defined in this repository.
