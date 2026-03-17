import React from 'react'
import { IDockviewPanelProps } from 'dockview-react'
import { clsx } from 'clsx'

interface ToolbarPanelWrapperProps {
    children: React.ReactNode
    className?: string
}

export const ToolbarPanelWrapper: React.FC<ToolbarPanelWrapperProps & Partial<IDockviewPanelProps>> = ({ 
    children, 
    className,
    api 
}) => {
    return (
        <div 
            className={clsx(
                "h-full w-full bg-bg-secondary flex flex-col overflow-hidden relative group",
                "dv-drag-handle cursor-move select-none", // Dockview 4+ drag handle class
                className
            )}
            onMouseDown={(e) => {
                // If the user clicks an interactive element, don't start a drag
                if ((e.target as HTMLElement).closest('button, input, select, a, [role="button"]')) {
                    return
                }
                // Optional: manually trigger drag if dv-drag-handle isn't enough
                // api?.group.model.startDrag(e.nativeEvent);
            }}
        >
            <div className="flex-1 flex min-h-0 min-w-0 pointer-events-auto cursor-default">
                {children}
            </div>
            
            {/* Corner resize handle for floating state feedback (visual only, dockview handles logic) */}
            <div className="absolute bottom-0 right-0 w-3 h-3 opacity-0 group-hover:opacity-40 pointer-events-none">
                <div className="w-full h-full border-r-2 border-b-2 border-text-disabled" />
            </div>
        </div>
    )
}
