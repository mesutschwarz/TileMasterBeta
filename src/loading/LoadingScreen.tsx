/**
 * LoadingScreen
 *
 * Full-screen startup splash rendered as a fixed overlay (z-index 9999).
 * It sits on top of the already-mounted App tree and fades away once the
 * progress simulation completes.
 *
 * ── Customisation ────────────────────────────────────────────────────
 *  • Timing / stages  →  useLoadingProgress.ts
 *  • Animations / CSS →  loading.css
 *  • Layout / copy    →  this file, sections marked "EDIT"
 * ──────────────────────────────────────────────────────────────────── */

import React from 'react'
import { useLoadingProgress, getStageLabel } from './useLoadingProgress'
import './loading.css'

// ─── EDIT: Configure sizes and spacing ───────────────────────────────
const LOGO_SIZE = 72   // px — width & height of the SVG icon
const PROGRESS_WIDTH = 220  // px — width of the progress bar
const GAP = 36   // px — vertical gap between logo, wordmark, bar
// ─────────────────────────────────────────────────────────────────────

interface LoadingScreenProps {
    onComplete: () => void
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
    const { progress, isExiting } = useLoadingProgress({ onComplete })

    return (
        <div className={`ls-screen${isExiting ? ' ls-exiting' : ''}`}>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: `${GAP}px`,
                    userSelect: 'none',
                }}
            >
                {/* ── Logo Icon ───────────────────────────── */}
                {/* EDIT: swap this for an <img> or different SVG as needed */}
                <div className={`ls-icon${isExiting ? '' : ' ls-floating'}`}>
                    <TileMasterIcon size={LOGO_SIZE} />
                </div>

                {/* ── Wordmark & Subtitle ─────────────────── */}
                <div style={{ textAlign: 'center' }}>
                    {/* EDIT: app name copy */}
                    <h1 className="ls-wordmark" style={{
                        margin: 0,
                        lineHeight: 1,
                        fontSize: '28px',
                        fontWeight: 800,
                        letterSpacing: '-0.025em',
                        color: 'var(--text-primary)',
                        fontFamily: 'inherit',
                    }}>
                        Tile<span style={{ color: 'var(--accent-primary)' }}>Master</span>
                    </h1>

                    {/* EDIT: tagline copy */}
                    <p className="ls-subtitle" style={{
                        margin: '10px 0 0',
                        fontSize: '10px',
                        fontWeight: 600,
                        letterSpacing: '0.22em',
                        textTransform: 'uppercase',
                        color: 'var(--text-secondary)',
                    }}>
                        Professional Retro Tile Designer
                    </p>
                </div>

                {/* ── Progress Bar ────────────────────────── */}
                <div className="ls-progress-wrap" style={{ width: `${PROGRESS_WIDTH}px` }}>
                    <div className="ls-progress-track">
                        <div
                            className="ls-progress-fill"
                            style={{ width: `${progress}%` }}
                        >
                            <div className="ls-shimmer" />
                        </div>
                    </div>

                    {/* Status label */}
                    <p className="ls-status" style={{
                        margin: '9px 0 0',
                        fontSize: '10px',
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: 'var(--text-disabled)',
                        textAlign: 'center',
                        fontWeight: 500,
                        height: '14px',           /* prevent layout shift */
                        transition: 'opacity 0.2s ease',
                    }}>
                        {getStageLabel(progress)}
                    </p>
                </div>
            </div>
        </div>
    )
}

// ─── TileMaster Logo Icon ─────────────────────────────────────────────
// A 3 × 3 tilemap grid that visualises the app's core concept.
// Each rect is a "tile" with an independently animated stagger (see
// .ls-tile:nth-child rules in loading.css) and a distinct opacity to
// suggest varied tile types — matching the accent colour palette.
//
// EDIT: Swap out for your own SVG mark if you add a brand asset later.
// ─────────────────────────────────────────────────────────────────────

const TILE_SIZE = 20   // px
const TILE_RADIUS = 4    // px border-radius
const TILE_GAP = 4    // px gap between tiles
const STEP = TILE_SIZE + TILE_GAP   // 24 px

// [opacity, use accent-secondary?]  — one entry per tile, row-major
const TILE_MAP: [number, boolean][] = [
    [1.00, false], [0.55, false], [0.80, true],
    [0.40, false], [1.00, false], [0.50, false],
    [0.65, true], [0.30, false], [0.85, false],
]

interface TileMasterIconProps {
    size: number
}

const TileMasterIcon: React.FC<TileMasterIconProps> = ({ size }) => {
    const viewBox = STEP * 3 - TILE_GAP   // 68

    return (
        <svg
            width={size}
            height={size}
            viewBox={`0 0 ${viewBox} ${viewBox}`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            {TILE_MAP.map(([opacity, isSecondary], i) => {
                const col = i % 3
                const row = Math.floor(i / 3)
                return (
                    <rect
                        key={i}
                        className="ls-tile"
                        x={col * STEP}
                        y={row * STEP}
                        width={TILE_SIZE}
                        height={TILE_SIZE}
                        rx={TILE_RADIUS}
                        opacity={opacity}
                        style={{
                            fill: isSecondary
                                ? 'var(--accent-secondary, #8b5cf6)'
                                : 'var(--accent-primary,   #ec4899)',
                        }}
                    />
                )
            })}
        </svg>
    )
}
