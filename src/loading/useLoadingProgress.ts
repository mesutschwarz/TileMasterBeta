/**
 * useLoadingProgress
 *
 * Drives the loading-screen progress bar through a series of staged
 * increments that mimic real initialization work, then triggers the
 * exit animation and calls onComplete when the screen should unmount.
 *
 * ── Timing ──────────────────────────────────────────────────────────
 *  0 ms  →  20 %   Immediate jump (store hydrated, theme applied)
 *  80 ms  →  45 %   Quick ramp (React tree evaluated)
 * 280 ms  →  68 %   Moderate fill (components mounted)
 * 600 ms  →  85 %   Slower fill (canvas contexts, stores ready)
 * 900 ms  →  95 %   Near-complete
 * 1 100 ms →  100 %  Done
 * 1 300 ms          Exit animation begins
 * 1 750 ms          onComplete fires — caller removes the screen
 *
 * Edit the timeout values above to adjust the perceived load time.
 * ────────────────────────────────────────────────────────────────── */

import { useState, useEffect } from 'react'

// Human-readable stage labels shown below the progress bar.
// Keys are the progress % at which each label becomes active (inclusive).
export const LOADING_STAGES: Record<number, string> = {
    0: 'Initializing…',
    45: 'Loading assets…',
    68: 'Preparing workspace…',
    95: 'Almost ready…',
    100: 'Ready',
}

export function getStageLabel(progress: number): string {
    const thresholds = Object.keys(LOADING_STAGES)
        .map(Number)
        .sort((a, b) => b - a)           // descending
    const match = thresholds.find(t => progress >= t)
    return LOADING_STAGES[match ?? 0]
}

interface UseLoadingProgressOptions {
    onComplete: () => void
}

interface UseLoadingProgressResult {
    /** Current progress, 0–100 */
    progress: number
    /** True once progress reaches 100 and exit animation should play */
    isExiting: boolean
}

export function useLoadingProgress({ onComplete }: UseLoadingProgressOptions): UseLoadingProgressResult {
    const [progress, setProgress] = useState(0)
    const [isExiting, setIsExiting] = useState(false)

    useEffect(() => {
        const timers: ReturnType<typeof setTimeout>[] = []

        const schedule = (ms: number, fn: () => void) => {
            timers.push(setTimeout(fn, ms))
        }

        schedule(0, () => setProgress(20))
        schedule(80, () => setProgress(45))
        schedule(280, () => setProgress(68))
        schedule(600, () => setProgress(85))
        schedule(900, () => setProgress(95))
        schedule(1100, () => setProgress(100))
        schedule(1300, () => setIsExiting(true))
        schedule(1750, () => onComplete())

        return () => timers.forEach(clearTimeout)
    }, [onComplete])

    return { progress, isExiting }
}
