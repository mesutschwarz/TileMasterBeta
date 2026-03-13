import { DEFAULT_PROJECT_NAME } from '../app.config'

export const normalizeProjectName = (value?: string | null): string => {
    const trimmed = value?.trim()
    return trimmed && trimmed.length > 0 ? trimmed : DEFAULT_PROJECT_NAME
}

export const toSnakeCaseIdentifier = (value?: string | null): string => {
    const normalized = normalizeProjectName(value)
    const snake = normalized
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .replace(/_+/g, '_')

    if (!snake) return 'project_name'
    if (/^[0-9]/.test(snake)) return `project_${snake}`
    return snake
}

export const toProjectFileStem = (value?: string | null): string => normalizeProjectName(value)
