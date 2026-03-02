const readCssVar = (name: string, fallback: string) => {
    if (typeof window === 'undefined') return fallback
    const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
    return value || fallback
}

const toRgba = (color: string, alpha: number) => {
    const trimmed = color.trim()
    if (trimmed.startsWith('rgba(')) {
        const parts = trimmed.replace('rgba(', '').replace(')', '').split(',').map(p => p.trim())
        if (parts.length >= 3) {
            return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${alpha})`
        }
    }
    if (trimmed.startsWith('rgb(')) {
        const parts = trimmed.replace('rgb(', '').replace(')', '').split(',').map(p => p.trim())
        if (parts.length >= 3) {
            return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${alpha})`
        }
    }
    if (trimmed.startsWith('#')) {
        const hex = trimmed.replace('#', '')
        if (hex.length === 3) {
            const r = parseInt(hex[0] + hex[0], 16)
            const g = parseInt(hex[1] + hex[1], 16)
            const b = parseInt(hex[2] + hex[2], 16)
            return `rgba(${r}, ${g}, ${b}, ${alpha})`
        }
        if (hex.length === 6 || hex.length === 8) {
            const r = parseInt(hex.substring(0, 2), 16)
            const g = parseInt(hex.substring(2, 4), 16)
            const b = parseInt(hex.substring(4, 6), 16)
            return `rgba(${r}, ${g}, ${b}, ${alpha})`
        }
    }
    return trimmed
}

export const getThemeCanvasColors = () => {
    const accent = readCssVar('--accent-primary', '#6366f1')
    const danger = readCssVar('--ui-danger', '#ef4444')
    const warning = readCssVar('--ui-warning', '#f59e0b')

    return {
        accent,
        accentStrong: toRgba(accent, 0.8),
        accentMedium: toRgba(accent, 0.5),
        accentSoft: toRgba(accent, 0.6),
        accentFaint: toRgba(accent, 0.3),
        danger,
        warning,
        dangerFill: toRgba(danger, 0.4),
        dangerStrong: toRgba(danger, 0.6),
        warningFill: toRgba(warning, 0.4),
        warningSoft: toRgba(warning, 0.6)
    }
}
