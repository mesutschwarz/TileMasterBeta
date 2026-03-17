import React from 'react'
import { useGesture } from '@use-gesture/react'
import { Search, Maximize, Info } from 'lucide-react'
import { clsx } from 'clsx'
import { Tooltip } from './Tooltip'

interface CanvasViewportProps {
    containerRef: React.RefObject<HTMLDivElement>
    zoom: number
    setZoom: (nextZoom: number) => void
    zoomMin: number
    zoomMax: number
    offset: { x: number, y: number }
    setOffset: React.Dispatch<React.SetStateAction<{ x: number, y: number }>>
    onZoomToFit: () => void
    onPanningChange?: (panning: boolean) => void
    cursorClassName?: string
    canvasWidth: number
    canvasHeight: number
    canvasWrapperClassName?: string
    infoContent: React.ReactNode
    formatZoomLabel: (zoom: number) => string
    children: React.ReactNode
    containerProps?: React.HTMLAttributes<HTMLDivElement>
}

export const CanvasViewport: React.FC<CanvasViewportProps> = ({
    containerRef,
    zoom,
    setZoom,
    zoomMin,
    zoomMax,
    offset,
    setOffset,
    onZoomToFit,
    onPanningChange,
    cursorClassName,
    canvasWidth,
    canvasHeight,
    canvasWrapperClassName,
    infoContent,
    formatZoomLabel,
    children,
    containerProps
}) => {
    const [showZoomSlider, setShowZoomSlider] = React.useState(false)

    useGesture(
        {
            onDrag: ({ delta: [dx, dy], event, buttons, active }) => {
                const pointerEvent = event as PointerEvent
                if (buttons === 4 || (buttons === 1 && pointerEvent.shiftKey)) {
                    if (event.cancelable) event.preventDefault()
                    onPanningChange?.(active)
                    setOffset(o => ({ x: o.x + dx, y: o.y + dy }))
                } else if (!active) {
                    onPanningChange?.(false)
                }
            },
            onWheel: ({ delta: [, dy], event }) => {
                const zoomSpeed = 0.001
                const factor = Math.pow(2, -dy * zoomSpeed)
                const nextZoom = zoom * factor
                setZoom(Math.max(zoomMin, Math.min(zoomMax, nextZoom)))
                if (event.cancelable) event.preventDefault()
            }
        },
        {
            target: containerRef,
            eventOptions: { passive: false },
            drag: { pointer: { buttons: [1, 2, 4] } }
        }
    )

    return (
        <div
            ref={containerRef}
            className={clsx(
                "w-full h-full relative bg-transparent overflow-hidden touch-none flex items-center justify-center",
                cursorClassName
            )}
            {...containerProps}
        >
            <div
                className={clsx(
                    "relative shadow-[0_24px_48px_-28px_rgba(0,0,0,0.85)] border border-ui-border-strong/70 bg-bg-primary transition-transform duration-75 ease-out shrink-0 overflow-hidden ring-1 ring-ui-border/40",
                    canvasWrapperClassName
                )}
                style={{
                    width: canvasWidth,
                    height: canvasHeight,
                    transform: `translate(${offset.x}px, ${offset.y}px)`
                }}
            >
                {children}
            </div>

            {/* Bottom Right: Controls Stack */}
            <div className="canvas-controls">
                <div className="canvas-control-group">
                    <Tooltip position="left" content={infoContent}>
                        <div className="canvas-control-button cursor-help">
                            <Info size={18} />
                        </div>
                    </Tooltip>
                </div>

                <div className="canvas-control-group">
                    {showZoomSlider && (
                        <div className="zoom-slider-container animate-in slide-in-from-right-2 duration-200">
                            <span className="text-[10px] font-mono text-text-secondary w-10 text-right">{formatZoomLabel(zoom)}</span>
                            <input
                                type="range" min={zoomMin} max={zoomMax} step="0.1" value={zoom}
                                onChange={(e) => setZoom(parseFloat(e.target.value))}
                                className="w-32 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent-primary"
                            />
                        </div>
                    )}
                    <button
                        onClick={() => setShowZoomSlider(!showZoomSlider)}
                        className={clsx(
                            "canvas-control-button",
                            showZoomSlider && "canvas-control-button-active"
                        )}
                        title="Zoom Slider"
                    >
                        <Search size={18} />
                    </button>
                </div>

                <div className="canvas-control-group">
                    <button
                        onClick={onZoomToFit}
                        className="canvas-control-button"
                        title="Fit to Window"
                    >
                        <Maximize size={18} />
                    </button>
                </div>
            </div>
        </div>
    )
}
