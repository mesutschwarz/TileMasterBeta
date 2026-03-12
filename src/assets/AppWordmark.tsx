/**
 * AppWordmark.tsx — Reusable application text wordmark.
 *
 * Renders the two-tone application name where the first part is
 * drawn in the primary text colour and the second part in the
 * theme's accent colour.  Both parts are sourced from app.config.ts.
 *
 * ── Customisation ─────────────────────────────────────────────────────
 *  • Name text          →  APP_NAME_PART1 / APP_NAME_PART2 in app.config.ts
 *  • Accent colour      →  --accent-primary CSS variable (set by theme.runtime)
 *  • Font size / weight →  fontSize / fontWeight props (or className)
 * ─────────────────────────────────────────────────────────────────────── */

import React, { CSSProperties } from 'react'
import { APP_NAME_PART1, APP_NAME_PART2 } from '../app.config'

export interface AppWordmarkProps {
    /**
     * Font size for the wordmark text.
     * Accepts any valid CSS font-size value (e.g. '14px', '1.5rem').
     * Default: '14px'
     */
    fontSize?: string
    /**
     * Font weight.
     * Default: 800
     */
    fontWeight?: CSSProperties['fontWeight']
    /**
     * Letter spacing.
     * Default: '-0.01em'
     */
    letterSpacing?: string
    /** Additional className applied to the root <span>. */
    className?: string
    /** Additional inline styles applied to the root <span>. */
    style?: CSSProperties
}

export const AppWordmark: React.FC<AppWordmarkProps> = ({
    fontSize = '14px',
    fontWeight = 800,
    letterSpacing = '-0.01em',
    className,
    style,
}) => (
    <span
        className={className}
        style={{
            fontSize,
            fontWeight,
            letterSpacing,
            lineHeight: 1,
            color: 'var(--text-primary)',
            fontFamily: 'inherit',
            userSelect: 'none',
            ...style,
        }}
    >
        {APP_NAME_PART1}
        <span style={{ color: 'var(--accent-primary)' }}>
            {APP_NAME_PART2}
        </span>
    </span>
)
