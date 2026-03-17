import React from 'react'
import { IDockviewPanelProps } from 'dockview-react'
import { DrawingToolbar } from '../TileEditor/DrawingToolbar'

export const DrawingToolsPanel: React.FC<IDockviewPanelProps> = ({ api }) => {
    const containerRef = React.useRef<HTMLDivElement>(null)
    const [isHorizontal, setIsHorizontal] = React.useState(true)

    React.useEffect(() => {
        let currentGroupEl: HTMLElement | null = null

        const updateGroupElement = () => {
            const nextGroupEl = containerRef.current?.closest('.dv-groupview') as HTMLElement | null
            if (nextGroupEl === currentGroupEl) return
            if (currentGroupEl) {
                currentGroupEl.classList.remove('drawing-tools-group')
            }
            if (nextGroupEl) {
                nextGroupEl.classList.add('drawing-tools-group')
            }
            currentGroupEl = nextGroupEl
        }

        const raf = requestAnimationFrame(updateGroupElement)
        const disposable = api.onDidGroupChange?.(() => {
            requestAnimationFrame(updateGroupElement)
        })

        return () => {
            cancelAnimationFrame(raf)
            if (currentGroupEl) {
                currentGroupEl.classList.remove('drawing-tools-group')
            }
            disposable?.dispose?.()
        }
    }, [api])

    React.useEffect(() => {
        const element = containerRef.current
        if (!element) return
        const observer = new ResizeObserver(entries => {
            const entry = entries[0]
            if (!entry) return
            const { width, height } = entry.contentRect
            setIsHorizontal(width >= height)
        })
        observer.observe(element)
        return () => observer.disconnect()
    }, [])

    return (
        <div ref={containerRef} className="drawing-tools-panel">
            <DrawingToolbar horizontal={isHorizontal} />
        </div>
    )
}
