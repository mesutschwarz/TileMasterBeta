import React, { useState, useRef, useEffect, ReactNode } from 'react'
import { clsx } from 'clsx'

export type DockPosition = 'top' | 'bottom' | 'left' | 'right' | 'floating'

interface DraggableToolbarProps {
    id: string
    title: string
    showTitle?: boolean
    dock: DockPosition
    position: { x: number, y: number }
    onDockChange: (dock: DockPosition) => void
    onPositionChange: (pos: { x: number, y: number }) => void
    children: ReactNode
    className?: string
}

export const DraggableToolbar: React.FC<DraggableToolbarProps> = ({
    id, title, showTitle = true, dock, position, onDockChange, onPositionChange, children, className
}) => {
    const [isDragging, setIsDragging] = useState(false)
    const dragStartOffset = useRef({ x: 0, y: 0 })
    const containerRef = useRef<HTMLDivElement>(null)
    const isPaletteBottomBar = id === 'palette' && dock === 'bottom'
    const showHandle = showTitle || dock === 'floating'

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true)
        dragStartOffset.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y
        }

        if (dock !== 'floating') {
            onDockChange('floating')
        }
    }

    useEffect(() => {
        if (!isDragging) return

        const handleMouseMove = (e: MouseEvent) => {
            const newX = e.clientX - dragStartOffset.current.x
            const newY = e.clientY - dragStartOffset.current.y
            onPositionChange({ x: newX, y: newY })

            // Simple snapping logic
            const threshold = 40
            const parent = containerRef.current?.parentElement
            if (parent) {
                const rect = parent.getBoundingClientRect()
                if (e.clientX < rect.left + threshold) onDockChange('left')
                else if (e.clientX > rect.right - threshold) onDockChange('right')
                else if (e.clientY < rect.top + threshold) onDockChange('top')
                else if (e.clientY > rect.bottom - threshold) onDockChange('bottom')
            }
        }

        const handleMouseUp = () => {
            setIsDragging(false)
        }

        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('mouseup', handleMouseUp)
        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleMouseUp)
        }
    }, [isDragging, dock, onDockChange, onPositionChange])

    return (
        <div
            ref={containerRef}
            data-toolbar-id={id}
            style={dock === 'floating' ? { left: position.x, top: position.y } : {}}
            className={clsx(
                "transition-[width,height,opacity] duration-200 select-none",
                dock === 'floating' ? "fixed z-[100] bg-bg-secondary rounded-md border border-ui-border-strong shadow-2xl overflow-hidden" : "relative flex-shrink-0",
                (dock === 'left' || dock === 'right') && "w-12 h-full border-ui-border-subtle bg-black/10",
                dock === 'left' && "border-r",
                dock === 'right' && "border-l",
                (dock === 'top' || dock === 'bottom') && !isPaletteBottomBar && "h-auto min-h-[3rem] w-full border-ui-border-subtle bg-bg-primary",
                isPaletteBottomBar && "absolute bottom-8 left-1/2 z-40 -translate-x-1/2 rounded-xl border border-ui-border-strong bg-bg-secondary/95 shadow-2xl",
                dock === 'top' && "border-b",
                dock === 'bottom' && !isPaletteBottomBar && "border-t",
                isDragging && "opacity-70 cursor-grabbing !transition-none",
                className
            )}
        >
            <div className="flex h-full w-full flex-col">
                {showHandle && (
                    <div
                        onMouseDown={handleMouseDown}
                        className={clsx(
                            "h-5 px-2 flex items-center justify-between border-b border-ui-border-subtle bg-bg-secondary text-[9px] uppercase tracking-[0.16em] text-text-secondary",
                            isDragging ? "cursor-grabbing" : "cursor-grab"
                        )}
                    >
                        <span className="truncate">{showTitle ? title : ''}</span>
                        <span className="text-text-disabled">⋮⋮</span>
                    </div>
                )}
                <div className={clsx(
                    "flex-1 flex",
                    isPaletteBottomBar
                        ? "flex-row items-center px-4 py-3"
                        : (dock === 'top' || dock === 'bottom')
                            ? "flex-row px-2 items-center"
                            : "flex-col py-2 items-center"
                )}>
                    {children}
                </div>
            </div>
        </div>
    )
}
