import React, { useState, useRef, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import { clsx } from 'clsx'

interface TooltipProps {
    content: React.ReactNode
    children: React.ReactNode
    shortcut?: string
    position?: 'top' | 'bottom' | 'left' | 'right'
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, shortcut, position = 'top' }) => {
    const [isVisible, setIsVisible] = useState(false)
    const triggerRef = useRef<HTMLDivElement>(null)
    const tooltipRef = useRef<HTMLDivElement>(null)
    const [coords, setCoords] = useState({ left: 0, top: 0 })

    useLayoutEffect(() => {
        if (!isVisible) return
        const trigger = triggerRef.current
        const tooltip = tooltipRef.current
        if (!trigger || !tooltip) return

        const triggerRect = trigger.getBoundingClientRect()
        const tooltipRect = tooltip.getBoundingClientRect()
        const padding = 8

        let left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2
        let top = triggerRect.top - tooltipRect.height - 10

        if (position === 'bottom') {
            top = triggerRect.bottom + 10
        }
        if (position === 'left') {
            left = triggerRect.left - tooltipRect.width - 10
            top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2
        }
        if (position === 'right') {
            left = triggerRect.right + 10
            top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2
        }

        const maxLeft = window.innerWidth - tooltipRect.width - padding
        const maxTop = window.innerHeight - tooltipRect.height - padding

        left = Math.min(Math.max(padding, left), Math.max(padding, maxLeft))
        top = Math.min(Math.max(padding, top), Math.max(padding, maxTop))

        setCoords({ left, top })
    }, [isVisible, position, content, shortcut])

    return (
        <div
            ref={triggerRef}
            className="relative inline-block"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            {isVisible && createPortal(
                <div
                    ref={tooltipRef}
                    className={clsx('modern-tooltip', `tooltip-${position}`)}
                    style={{ left: coords.left, top: coords.top }}
                >
                    <div className="flex items-center justify-between gap-3">
                        <div className="font-semibold text-[12px]">{content}</div>
                        {shortcut && (
                            <span className="px-1.5 py-0.5 rounded bg-bg-primary text-[10px] text-text-secondary border border-ui-border-subtle font-mono">{shortcut}</span>
                        )}
                    </div>
                </div>,
                document.body
            )}
        </div>
    )
}
