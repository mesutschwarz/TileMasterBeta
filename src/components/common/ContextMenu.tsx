import React from 'react'
import { createPortal } from 'react-dom'
import { clsx } from 'clsx'

export type ContextMenuEntry =
    | {
        type: 'item'
        id: string
        label: string
        icon?: React.ReactNode
        onSelect: () => void
        disabled?: boolean
    }
    | {
        type: 'separator'
        id: string
    }

interface ContextMenuProps {
    open: boolean
    x: number
    y: number
    entries: ContextMenuEntry[]
    onClose: () => void
    className?: string
}

const getFirstEnabledIndex = (entries: ContextMenuEntry[]) => {
    return entries.findIndex((entry) => entry.type === 'item' && !entry.disabled)
}

const getNextEnabledIndex = (entries: ContextMenuEntry[], startIndex: number, direction: 1 | -1) => {
    const total = entries.length
    if (total === 0) return -1
    let index = startIndex
    for (let i = 0; i < total; i += 1) {
        index = (index + direction + total) % total
        const entry = entries[index]
        if (entry.type === 'item' && !entry.disabled) return index
    }
    return -1
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
    open,
    x,
    y,
    entries,
    onClose,
    className
}) => {
    const menuRef = React.useRef<HTMLDivElement>(null)
    const [position, setPosition] = React.useState({ left: x, top: y })
    const [activeIndex, setActiveIndex] = React.useState(() => getFirstEnabledIndex(entries))

    React.useLayoutEffect(() => {
        if (!open) return
        const menu = menuRef.current
        if (!menu) return

        const { innerWidth, innerHeight } = window
        const rect = menu.getBoundingClientRect()
        const padding = 8
        const left = Math.min(Math.max(padding, x), Math.max(padding, innerWidth - rect.width - padding))
        const top = Math.min(Math.max(padding, y), Math.max(padding, innerHeight - rect.height - padding))
        setPosition({ left, top })
    }, [open, x, y, entries.length])

    React.useEffect(() => {
        if (!open) return
        setActiveIndex(getFirstEnabledIndex(entries))
        const menu = menuRef.current
        menu?.focus()
    }, [open, entries])

    React.useEffect(() => {
        if (!open) return

        const handlePointerDown = (event: MouseEvent) => {
            if (!menuRef.current) return
            if (!menuRef.current.contains(event.target as Node)) {
                onClose()
            }
        }

        const handleScroll = () => onClose()
        const handleResize = () => onClose()

        document.addEventListener('mousedown', handlePointerDown)
        window.addEventListener('scroll', handleScroll, true)
        window.addEventListener('resize', handleResize)

        return () => {
            document.removeEventListener('mousedown', handlePointerDown)
            window.removeEventListener('scroll', handleScroll, true)
            window.removeEventListener('resize', handleResize)
        }
    }, [open, onClose])

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (!open) return

        if (event.key === 'Escape') {
            event.preventDefault()
            onClose()
            return
        }

        if (event.key === 'ArrowDown') {
            event.preventDefault()
            setActiveIndex((prev) => getNextEnabledIndex(entries, prev, 1))
            return
        }

        if (event.key === 'ArrowUp') {
            event.preventDefault()
            setActiveIndex((prev) => getNextEnabledIndex(entries, prev, -1))
            return
        }

        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            const entry = entries[activeIndex]
            if (entry && entry.type === 'item' && !entry.disabled) {
                entry.onSelect()
                onClose()
            }
        }
    }

    if (!open) return null

    return createPortal(
        <div
            ref={menuRef}
            className={clsx('context-menu', className)}
            style={{ left: position.left, top: position.top }}
            role="menu"
            tabIndex={0}
            onKeyDown={handleKeyDown}
        >
            {entries.map((entry, index) => {
                if (entry.type === 'separator') {
                    return <div key={entry.id} className="h-[1px] bg-ui-border-subtle my-1" role="separator" />
                }

                const isActive = index === activeIndex

                return (
                    <button
                        key={entry.id}
                        type="button"
                        role="menuitem"
                        disabled={entry.disabled}
                        onClick={() => {
                            if (entry.disabled) return
                            entry.onSelect()
                            onClose()
                        }}
                        onMouseEnter={() => {
                            if (!entry.disabled) setActiveIndex(index)
                        }}
                        className={clsx('context-menu-item', isActive && 'is-active')}
                    >
                        {entry.icon && <span className="flex items-center text-inherit">{entry.icon}</span>}
                        <span className="flex-1 text-left">{entry.label}</span>
                    </button>
                )
            })}
        </div>,
        document.body
    )
}
