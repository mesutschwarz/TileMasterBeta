import React, { useState, useRef, useEffect, ReactNode } from 'react'
import { clsx } from 'clsx'

export type DockPosition = 'top' | 'bottom' | 'left' | 'right' | 'floating'

interface DraggableToolbarProps {
    id: string
    title: string
    showTitle?: boolean
    dock: DockPosition
    position: { x: number, y: number }
    size?: { width: number | 'auto', height: number | 'auto' }
    onDockChange: (dock: DockPosition) => void
    onPositionChange: (pos: { x: number, y: number }) => void
    onSizeChange?: (size: { width: number | 'auto', height: number | 'auto' }) => void
    children: ReactNode
    className?: string
}

export const DraggableToolbar: React.FC<DraggableToolbarProps> = ({
    id, title, showTitle = true, dock, position, size = { width: 'auto', height: 'auto' }, onDockChange, onPositionChange, onSizeChange, children, className
}) => {
    const [isDragging, setIsDragging] = useState(false)
    const [isResizing, setIsResizing] = useState(false)
    const dragStartOffset = useRef({ x: 0, y: 0 })
    const resizeStartSize = useRef({ width: 0, height: 0 })
    const resizeStartPos = useRef({ x: 0, y: 0 })
    const containerRef = useRef<HTMLDivElement>(null)
    const isPaletteBottomBar = id === 'palette' && dock === 'bottom'
    const showHandle = showTitle || dock === 'floating'

    const handleMouseDown = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement
        if (target.closest('.resize-handle')) return
        const isInteractive = target.closest('button, input, select, a')
        if (isInteractive) return

        setIsDragging(true)
        dragStartOffset.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y
        }

        if (dock !== 'floating') {
            onDockChange('floating')
        }
    }

    const handleResizeMouseDown = (e: React.MouseEvent) => {
        e.stopPropagation()
        e.preventDefault()
        setIsResizing(true)
        const rect = containerRef.current?.getBoundingClientRect()
        if (rect) {
            resizeStartSize.current = { width: rect.width, height: rect.height }
            resizeStartPos.current = { x: e.clientX, y: e.clientY }
        }
    }

    useEffect(() => {
        if (!isDragging && !isResizing) return

        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                const newX = e.clientX - dragStartOffset.current.x
                const newY = e.clientY - dragStartOffset.current.y
                onPositionChange({ x: newX, y: newY })

                const threshold = 60
                const parent = containerRef.current?.parentElement
                if (parent) {
                    const rect = parent.getBoundingClientRect()
                    if (e.clientX < rect.left + threshold) onDockChange('left')
                    else if (e.clientX > rect.right - threshold) onDockChange('right')
                    else if (e.clientY < rect.top + threshold) onDockChange('top')
                    else if (e.clientY > rect.bottom - threshold) onDockChange('bottom')
                }
            } else if (isResizing && onSizeChange) {
                const deltaX = e.clientX - resizeStartPos.current.x
                const deltaY = e.clientY - resizeStartPos.current.y
                onSizeChange({
                    width: Math.max(48, resizeStartSize.current.width + deltaX),
                    height: Math.max(48, resizeStartSize.current.height + deltaY)
                })
            }
        }

        const handleMouseUp = () => {
            setIsDragging(false)
            setIsResizing(false)
        }

        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('mouseup', handleMouseUp)
        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleMouseUp)
        }
    }, [isDragging, isResizing, dock, onDockChange, onPositionChange, onSizeChange])

    const isVertical = dock === 'left' || dock === 'right'
    
    const style: React.CSSProperties = dock === 'floating' ? { 
        left: position.x, 
        top: position.y,
        width: size.width,
        height: size.height
    } : {
        width: size.width,
        height: size.height
    }

    return (
        <div
            ref={containerRef}
            data-toolbar-id={id}
            onMouseDown={handleMouseDown}
            style={style}
            className={clsx(
                "draggable-toolbar",
                dock === 'floating' ? "draggable-toolbar-floating" : "draggable-toolbar-docked",
                isVertical && "draggable-toolbar-vertical",
                dock === 'left' && "border-r",
                dock === 'right' && "border-l",
                (dock === 'top' || dock === 'bottom') && !isPaletteBottomBar && "draggable-toolbar-horizontal",
                isPaletteBottomBar && "draggable-toolbar-palette-bottom",
                dock === 'top' && "border-b",
                dock === 'bottom' && !isPaletteBottomBar && "border-t",
                (isDragging || isResizing) && "opacity-70 !transition-none",
                isDragging && "cursor-grabbing",
                className
            )}
        >
            <div className="flex h-full w-full flex-col pointer-events-none relative">
                {showHandle && (
                    <div className="draggable-toolbar-handle pointer-events-auto">
                        <span className="truncate">{showTitle ? title : ''}</span>
                        <span className="text-text-disabled ml-2">⋮⋮</span>
                    </div>
                )}
                <div className={clsx(
                    "flex-1 flex pointer-events-auto",
                    isPaletteBottomBar
                        ? "flex-row items-center px-4 py-3"
                        : (dock === 'top' || dock === 'bottom')
                            ? "flex-row px-2 items-center"
                            : "flex-row items-start overflow-hidden" 
                )}>
                    {children}
                </div>

                {/* Resize Handle */}
                <div 
                    onMouseDown={handleResizeMouseDown}
                    className="resize-handle absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize pointer-events-auto flex items-end justify-end p-0.5 opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity"
                >
                    <div className="w-1.5 h-1.5 border-r-2 border-b-2 border-text-disabled" />
                </div>
            </div>
        </div>
    )
}
