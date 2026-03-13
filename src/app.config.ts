/**
 * app.config.ts — Single source of truth for application identity & branding.
 *
 * ── What belongs here ────────────────────────────────────────────────────────
 *  • Application name, tagline, version
 *  • Window / tab title
 *  • LocalStorage key names (so they never silently diverge across files)
 *  • Default export / project naming
 *
 * ── What does NOT belong here ────────────────────────────────────────────────
 *  • Visual layout constants  →  live in each component
 *  • Animation timing         →  loading/useLoadingProgress.ts
 *  • Theme colours            →  theme/theme.presets.ts
 *
 * Every other file in the project must import from here instead of using
 * hard-coded string literals for any of the values below.
 * ─────────────────────────────────────────────────────────────────────────── */

import pkg from '../package.json'

// ── Name ─────────────────────────────────────────────────────────────────────

/** Full display name of the application. */
export const APP_NAME = 'TileMaster'

/**
 * Name split into two parts for the two-tone wordmark rendering.
 * The wordmark renders PART1 in the primary text colour and PART2
 * in the accent colour.
 */
export const APP_NAME_PART1 = 'Tile'
export const APP_NAME_PART2 = 'Master'

// ── Tagline & version ─────────────────────────────────────────────────────────

/** Short subtitle shown beneath the wordmark. */
export const APP_TAGLINE = 'Professional Retro Tile Designer'

/** Semantic version, sourced directly from package.json at build time. */
export const APP_VERSION: string = pkg.version

/** Full browser window / tab title. */
export const APP_TITLE = `${APP_NAME} — ${APP_TAGLINE}`

// ── Storage keys ──────────────────────────────────────────────────────────────
/**
 * All localStorage key strings in one place.
 * To migrate / reset a key just change the value here — every consumer
 * automatically picks up the new key name.
 */
export const STORAGE_KEYS = {
    settings: 'tilemaster-settings',
    platform: 'tilemaster-platform',
    onboarding: 'tilemaster_onboarding_v1',
} as const

// ── Project defaults ──────────────────────────────────────────────────────────

/**
 * Default project name used when a project has not been renamed yet.
 */
export const DEFAULT_PROJECT_NAME = 'Project Name'
