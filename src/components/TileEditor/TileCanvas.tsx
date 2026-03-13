import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import { useProjectStore } from '../../stores/projectStore'
import { useEditorStore } from '../../stores/editorStore'
import * as Draw from '../../utils/drawingAlgorithms'
import { getThemeCanvasColors } from '../../utils/themeColors'
import { CanvasViewport } from '../common/CanvasViewport'
import { formatTileLabel } from '../../utils/tileLabels'

export const TileCanvas: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const {
        platform, tileset, selectedTileId, updateTile,
        recordHistory, recordHistoryDebounced, recordHistoryIfChanged
    } = useProjectStore()
    const {
        zoom, setZoom,
        activeColorIndex, setActiveColorIndex, selectedTool,
        gridSettings, showGrid,
        brushSize, brushShape,
        themeId
    } = useEditorStore()

    const [offset, setOffset] = useState({ x: 0, y: 0 })
    const [isDrawing, setIsDrawing] = useState(false)
    const [isPanning, setIsPanning] = useState(false)
    const [lastPoint, setLastPoint] = useState<Draw.Point | null>(null)
    const [shapeStart, setShapeStart] = useState<Draw.Point | null>(null)
    const [shapePreview, setShapePreview] = useState<Draw.Point[]>([])
    const [shapeFill, setShapeFill] = useState(false)
    const [selectionStart, setSelectionStart] = useState<Draw.Point | null>(null)
    const [selectionEnd, setSelectionEnd] = useState<Draw.Point | null>(null)
    const [selectionClipboard, setSelectionClipboard] = useState<{ data: number[]; width: number; height: number } | null>(null)
    const [cursorPixel, setCursorPixel] = useState<Draw.Point | null>(null)
    const [selectionDragOffset, setSelectionDragOffset] = useState<{ x: number; y: number } | null>(null)
    const [selectionDragOrigin, setSelectionDragOrigin] = useState<{ xMin: number; yMin: number; xMax: number; yMax: number; data: number[] } | null>(null)
    const [selectionDragStart, setSelectionDragStart] = useState<Draw.Point | null>(null)
    const strokeChangedRef = useRef(false)

    const selectedTile = tileset.tiles.find(t => t.id === selectedTileId)
    const selectedTileIndex = useMemo(() => tileset.tiles.findIndex(t => t.id === selectedTileId), [tileset.tiles, selectedTileId])
    const selectedTileLabel = useMemo(() => {
        if (selectedTileIndex < 0) return 'Tile #00'
        return formatTileLabel(selectedTileIndex, selectedTile?.name)
    }, [selectedTileIndex, selectedTile])

    const tileBitmap = useMemo(() => {
        if (!selectedTile || typeof document === 'undefined') return null
        const canvas = document.createElement('canvas')
        canvas.width = selectedTile.width
        canvas.height = selectedTile.height
        const ctx = canvas.getContext('2d')
        if (!ctx) return canvas
        ctx.imageSmoothingEnabled = false
        selectedTile.data.forEach((colorIndex, i) => {
            const x = i % selectedTile.width
            const y = Math.floor(i / selectedTile.width)
            ctx.fillStyle = platform.defaultPalette[colorIndex]
            ctx.fillRect(x, y, 1, 1)
        })
        return canvas
    }, [selectedTile, platform.defaultPalette])

    const themeColors = useMemo(() => getThemeCanvasColors(), [themeId])

    const centerCanvas = useCallback(() => {
        setOffset({ x: 0, y: 0 })
    }, [])

    const handleZoomToFit = useCallback(() => {
        if (containerRef.current && selectedTile) {
            const rect = containerRef.current.getBoundingClientRect()
            const padding = 64
            const availableWidth = rect.width - padding
            const availableHeight = rect.height - padding
            const fitZoom = Math.max(4, Math.min(128, Math.floor(Math.min(
                availableWidth / platform.tileWidth,
                availableHeight / platform.tileHeight
            ))))
            setZoom(fitZoom)
            centerCanvas()
        }
    }, [selectedTile, platform.tileWidth, platform.tileHeight, setZoom, centerCanvas])

    useEffect(() => {
        centerCanvas()
    }, [selectedTileId, centerCanvas])

    // Render logic
    useEffect(() => {
        let frameId: number | null = null

        const draw = () => {
            const canvas = canvasRef.current
            if (!canvas || !selectedTile) return
            const ctx = canvas.getContext('2d')
            if (!ctx) return

            const dpr = window.devicePixelRatio || 1
            canvas.width = platform.tileWidth * zoom * dpr
            canvas.height = platform.tileHeight * zoom * dpr
            canvas.style.width = `${platform.tileWidth * zoom}px`
            canvas.style.height = `${platform.tileHeight * zoom}px`

            ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
            ctx.imageSmoothingEnabled = false
            ctx.clearRect(0, 0, platform.tileWidth * zoom, platform.tileHeight * zoom)

            if (tileBitmap) {
                ctx.drawImage(
                    tileBitmap,
                    0,
                    0,
                    platform.tileWidth * zoom,
                    platform.tileHeight * zoom
                )
            }

            if (showGrid && gridSettings.enabled) {
                ctx.strokeStyle = gridSettings.color
                ctx.globalAlpha = gridSettings.opacity
                ctx.lineWidth = 1 / dpr
                for (let x = 0; x <= platform.tileWidth; x += gridSettings.size) {
                    ctx.beginPath(); ctx.moveTo(x * zoom, 0); ctx.lineTo(x * zoom, platform.tileHeight * zoom); ctx.stroke()
                }
                for (let y = 0; y <= platform.tileHeight; y += gridSettings.size) {
                    ctx.beginPath(); ctx.moveTo(0, y * zoom); ctx.lineTo(platform.tileWidth * zoom, y * zoom); ctx.stroke()
                }
                ctx.globalAlpha = 1.0
            }

            if (shapePreview.length > 0) {
                ctx.save()
                ctx.globalAlpha = 0.6
                ctx.fillStyle = platform.defaultPalette[activeColorIndex]
                shapePreview.forEach((p) => {
                    ctx.fillRect(p.x * zoom, p.y * zoom, zoom, zoom)
                })
                ctx.restore()
            }

            if (selectionStart && selectionEnd) {
                const xMinBase = Math.min(selectionStart.x, selectionEnd.x)
                const yMinBase = Math.min(selectionStart.y, selectionEnd.y)
                const xMaxBase = Math.max(selectionStart.x, selectionEnd.x)
                const yMaxBase = Math.max(selectionStart.y, selectionEnd.y)
                const dx = selectionDragOffset?.x ?? 0
                const dy = selectionDragOffset?.y ?? 0
                const xMin = xMinBase + dx
                const yMin = yMinBase + dy
                const xMax = xMaxBase + dx
                const yMax = yMaxBase + dy
                ctx.save()
                ctx.setLineDash([4, 2])
                ctx.strokeStyle = themeColors.accent
                ctx.lineWidth = 1
                ctx.strokeRect(
                    xMin * zoom + 0.5,
                    yMin * zoom + 0.5,
                    (xMax - xMin + 1) * zoom,
                    (yMax - yMin + 1) * zoom
                )
                ctx.restore()
            }

            if (cursorPixel && (selectedTool === 'pencil' || selectedTool === 'eraser')) {
                const radius = Math.floor(Math.max(1, brushSize) / 2)
                const size = (radius * 2 + 1) * zoom
                const x = (cursorPixel.x - radius) * zoom
                const y = (cursorPixel.y - radius) * zoom
                ctx.save()
                ctx.strokeStyle = themeColors.accentStrong
                ctx.lineWidth = 1
                if (brushShape === 'circle') {
                    ctx.beginPath()
                    ctx.arc((cursorPixel.x + 0.5) * zoom, (cursorPixel.y + 0.5) * zoom, (radius + 0.5) * zoom, 0, Math.PI * 2)
                    ctx.stroke()
                } else {
                    ctx.strokeRect(x + 0.5, y + 0.5, size, size)
                }
                ctx.restore()
            }
        }

        frameId = window.requestAnimationFrame(draw)
        return () => {
            if (frameId) window.cancelAnimationFrame(frameId)
        }
    }, [selectedTile, zoom, gridSettings, showGrid, platform, shapePreview, activeColorIndex, selectionStart, selectionEnd, tileBitmap, themeColors])

    const getPixelCoords = (e: React.PointerEvent | PointerEvent) => {
        const canvas = canvasRef.current
        if (!canvas) return null
        const rect = canvas.getBoundingClientRect()
        return {
            x: Math.floor((e.clientX - rect.left) / zoom),
            y: Math.floor((e.clientY - rect.top) / zoom)
        }
    }

    const getSelectionBounds = () => {
        if (!selectionStart || !selectionEnd) return null
        const xMin = Math.min(selectionStart.x, selectionEnd.x)
        const yMin = Math.min(selectionStart.y, selectionEnd.y)
        const xMax = Math.max(selectionStart.x, selectionEnd.x)
        const yMax = Math.max(selectionStart.y, selectionEnd.y)
        return { xMin, yMin, xMax, yMax }
    }

    const applyDrawing = (points: Draw.Point[], colorIdx: number) => {
        if (!selectedTile || !selectedTileId) return
        const newData = [...selectedTile.data]
        let changed = false
        const radius = Math.floor(Math.max(1, brushSize) / 2)
        points.forEach(p => {
            for (let dy = -radius; dy <= radius; dy++) {
                for (let dx = -radius; dx <= radius; dx++) {
                    if (brushShape === 'circle' && (dx * dx + dy * dy) > (radius * radius)) continue
                    const x = p.x + dx
                    const y = p.y + dy
                    if (x >= 0 && x < platform.tileWidth && y >= 0 && y < platform.tileHeight) {
                        const idx = y * platform.tileWidth + x
                        if (newData[idx] !== colorIdx) {
                            newData[idx] = colorIdx
                            changed = true
                        }
                    }
                }
            }
        })
        if (changed) updateTile(selectedTileId, newData)
        return changed
    }

    const handlePointerDown = (e: React.PointerEvent) => {
        if (e.button !== 0 || isPanning || !selectedTile) return
        const coords = getPixelCoords(e)
        if (!coords) return

        const colorIdx = selectedTool === 'eraser' ? 0 : activeColorIndex

        if (selectedTool === 'select') {
            const bounds = getSelectionBounds()
            if (bounds && coords.x >= bounds.xMin && coords.x <= bounds.xMax && coords.y >= bounds.yMin && coords.y <= bounds.yMax) {
                const data: number[] = []
                for (let y = bounds.yMin; y <= bounds.yMax; y++) {
                    for (let x = bounds.xMin; x <= bounds.xMax; x++) {
                        data.push(selectedTile.data[y * platform.tileWidth + x])
                    }
                }
                setSelectionDragOrigin({ ...bounds, data })
                setSelectionDragStart(coords)
                setSelectionDragOffset({ x: 0, y: 0 })
            } else {
                setSelectionStart(coords)
                setSelectionEnd(coords)
                setSelectionDragOffset(null)
                setSelectionDragOrigin(null)
                setSelectionDragStart(null)
            }
            return
        }

        if (selectedTool === 'line' || selectedTool === 'rect' || selectedTool === 'circle') {
            setShapeStart(coords)
            setShapeFill((selectedTool === 'rect' || selectedTool === 'circle') && e.shiftKey)
            setShapePreview([coords])
            return
        }

        if (selectedTool === 'fill') {
            const targetColor = selectedTile?.data[coords.y * platform.tileWidth + coords.x]
            if (targetColor !== undefined && targetColor !== colorIdx) {
                const fillIndices = Draw.getFloodFill(selectedTile!.data, platform.tileWidth, platform.tileHeight, coords, colorIdx)
                const newData = [...selectedTile!.data]
                fillIndices.forEach(idx => newData[idx] = colorIdx)
                updateTile(selectedTileId!, newData)
                recordHistoryIfChanged('Tile: Fill')
            }
        } else if (selectedTool === 'picker') {
            const picked = selectedTile?.data[coords.y * platform.tileWidth + coords.x]
            if (picked !== undefined) {
                setActiveColorIndex(picked)
            }
        } else {
            setIsDrawing(true)
            strokeChangedRef.current = false
            setLastPoint(coords)
            const changed = applyDrawing([coords], colorIdx)
            if (changed) strokeChangedRef.current = true
        }
    }

    const handlePointerMove = (e: React.PointerEvent) => {
        const hoverCoords = getPixelCoords(e)
        if (hoverCoords) setCursorPixel(hoverCoords)

        if (selectedTool === 'select' && selectionStart) {
            if (selectionDragStart && selectionDragOrigin && hoverCoords) {
                setSelectionDragOffset({
                    x: hoverCoords.x - selectionDragStart.x,
                    y: hoverCoords.y - selectionDragStart.y
                })
            } else if (hoverCoords) {
                setSelectionEnd(hoverCoords)
            }
            return
        }

        if (shapeStart) {
            const coords = getPixelCoords(e)
            if (!coords) return
            const fill = (selectedTool === 'rect' || selectedTool === 'circle') && e.shiftKey
            setShapeFill(fill)
            const points = selectedTool === 'line'
                ? Draw.getPixelPerfectLine(shapeStart, coords)
                : selectedTool === 'rect'
                    ? Draw.getRectangle(shapeStart, coords, fill)
                    : fill
                        ? Draw.getFilledCircle(shapeStart, Math.max(0, Math.round(Math.hypot(coords.x - shapeStart.x, coords.y - shapeStart.y))))
                        : Draw.getCircle(shapeStart, Math.max(0, Math.round(Math.hypot(coords.x - shapeStart.x, coords.y - shapeStart.y))))
            setShapePreview(points)
            return
        }
        if (!isDrawing || !lastPoint) return
        const coords = getPixelCoords(e)
        if (!coords) return
        const colorIdx = selectedTool === 'eraser' ? 0 : activeColorIndex
        const points = Draw.getBresenhamLine(lastPoint, coords)
        const changed = applyDrawing(points, colorIdx)
        if (changed) strokeChangedRef.current = true
        setLastPoint(coords)
    }

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (document.activeElement instanceof HTMLInputElement ||
                document.activeElement instanceof HTMLTextAreaElement) return

            if (e.key === 'Escape') {
                setSelectionStart(null)
                setSelectionEnd(null)
                setSelectionDragOffset(null)
                setSelectionDragOrigin(null)
                setSelectionDragStart(null)
                return
            }

            if (!selectedTile || !selectedTileId) return

            const bounds = getSelectionBounds()
            if ((e.ctrlKey || e.metaKey) && bounds) {
                if (e.key.toLowerCase() === 'c') {
                    e.preventDefault()
                    const { xMin, yMin, xMax, yMax } = bounds
                    const width = xMax - xMin + 1
                    const height = yMax - yMin + 1
                    const data: number[] = []
                    for (let y = yMin; y <= yMax; y++) {
                        for (let x = xMin; x <= xMax; x++) {
                            data.push(selectedTile.data[y * platform.tileWidth + x])
                        }
                    }
                    setSelectionClipboard({ data, width, height })
                    return
                }

                if (e.key.toLowerCase() === 'x') {
                    e.preventDefault()
                    const { xMin, yMin, xMax, yMax } = bounds
                    const width = xMax - xMin + 1
                    const height = yMax - yMin + 1
                    const data: number[] = []
                    const newData = [...selectedTile.data]
                    for (let y = yMin; y <= yMax; y++) {
                        for (let x = xMin; x <= xMax; x++) {
                            data.push(selectedTile.data[y * platform.tileWidth + x])
                            newData[y * platform.tileWidth + x] = 0
                        }
                    }
                    updateTile(selectedTileId, newData)
                    recordHistoryIfChanged('Tile: Cut')
                    setSelectionClipboard({ data, width, height })
                    return
                }
            }

            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v' && selectionClipboard) {
                e.preventDefault()
                const target = cursorPixel || selectionStart
                if (!target) return
                const newData = [...selectedTile.data]
                for (let y = 0; y < selectionClipboard.height; y++) {
                    for (let x = 0; x < selectionClipboard.width; x++) {
                        const dx = target.x + x
                        const dy = target.y + y
                        if (dx >= 0 && dx < platform.tileWidth && dy >= 0 && dy < platform.tileHeight) {
                            const value = selectionClipboard.data[y * selectionClipboard.width + x]
                            newData[dy * platform.tileWidth + dx] = value
                        }
                    }
                }
                updateTile(selectedTileId, newData)
                recordHistoryIfChanged('Tile: Paste')
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [selectedTile, selectedTileId, selectionStart, selectionEnd, selectionClipboard, cursorPixel, platform.tileWidth, platform.tileHeight, recordHistory, updateTile])

    if (!selectedTile) {
        return <div className="flex-1 flex items-center justify-center text-gray-500 italic">Select a tile to start editing</div>
    }

    const infoContent = (
        <div className="flex flex-col gap-1 p-1 min-w-[100px]">
            <div className="flex justify-between items-center gap-4">
                <span className="text-gray-500 font-bold uppercase tracking-widest text-[8px]">Tile</span>
                <span className="text-gray-200 font-mono text-[10px]">{selectedTileLabel}</span>
            </div>
            <div className="h-px bg-white/5 my-0.5" />
            <div className="flex justify-between items-center gap-4">
                <span className="text-gray-500 font-bold uppercase tracking-widest text-[8px]">Tool</span>
                <span className="text-accent-primary font-bold uppercase text-[10px]">{selectedTool}</span>
            </div>
            <div className="h-px bg-white/5 my-0.5" />
            <div className="flex justify-between items-center gap-4">
                <span className="text-gray-500 font-bold uppercase tracking-widest text-[8px]">Size</span>
                <span className="text-gray-200 font-mono text-[10px]">{platform.tileWidth}x{platform.tileHeight}</span>
            </div>
            <div className="h-px bg-white/5 my-0.5" />
            <div className="flex justify-between items-center gap-4">
                <span className="text-gray-500 font-bold uppercase tracking-widest text-[8px]">Brush</span>
                <span className="text-gray-200 font-mono text-[10px]">{brushSize}px {brushShape}</span>
            </div>
        </div>
    )

    return (
        <CanvasViewport
            containerRef={containerRef}
            zoom={zoom}
            setZoom={setZoom}
            zoomMin={4}
            zoomMax={128}
            offset={offset}
            setOffset={setOffset}
            onZoomToFit={handleZoomToFit}
            onPanningChange={setIsPanning}
            cursorClassName={isPanning ? "cursor-grabbing" : (selectedTool === 'select' ? "cursor-cell" : (selectedTool === 'fill' ? "cursor-copy" : "cursor-crosshair"))}
            canvasWidth={platform.tileWidth * zoom}
            canvasHeight={platform.tileHeight * zoom}
            infoContent={infoContent}
            formatZoomLabel={(value) => `${Math.round((value / 16) * 100)}%`}
            containerProps={{
                onPointerDown: handlePointerDown,
                onPointerMove: handlePointerMove,
                onPointerUp: (e) => {
                    if (selectedTool === 'select') {
                        const coords = getPixelCoords(e as unknown as PointerEvent)
                        if (selectionDragOrigin && selectionDragOffset && selectedTile && selectedTileId) {
                            const { xMin, yMin, xMax, yMax, data } = selectionDragOrigin
                            const dx = selectionDragOffset.x
                            const dy = selectionDragOffset.y
                            if (dx !== 0 || dy !== 0) {
                                const newData = [...selectedTile.data]
                                for (let y = yMin; y <= yMax; y++) {
                                    for (let x = xMin; x <= xMax; x++) {
                                        newData[y * platform.tileWidth + x] = 0
                                    }
                                }
                                const width = xMax - xMin + 1
                                const height = yMax - yMin + 1
                                for (let y = 0; y < height; y++) {
                                    for (let x = 0; x < width; x++) {
                                        const tx = xMin + dx + x
                                        const ty = yMin + dy + y
                                        if (tx >= 0 && tx < platform.tileWidth && ty >= 0 && ty < platform.tileHeight) {
                                            newData[ty * platform.tileWidth + tx] = data[y * width + x]
                                        }
                                    }
                                }
                                updateTile(selectedTileId, newData)
                                recordHistoryIfChanged('Tile: Move Selection')
                                setSelectionStart({ x: xMin + dx, y: yMin + dy })
                                setSelectionEnd({ x: xMax + dx, y: yMax + dy })
                            }
                        } else if (coords) {
                            setSelectionEnd(coords)
                        }
                        setSelectionDragOffset(null)
                        setSelectionDragOrigin(null)
                        setSelectionDragStart(null)
                        return
                    }
                    if (shapeStart) {
                        const coords = getPixelCoords(e as unknown as PointerEvent)
                        if (coords) {
                            const points = selectedTool === 'line'
                                ? Draw.getPixelPerfectLine(shapeStart, coords)
                                : selectedTool === 'rect'
                                    ? Draw.getRectangle(shapeStart, coords, shapeFill)
                                    : shapeFill
                                        ? Draw.getFilledCircle(shapeStart, Math.max(0, Math.round(Math.hypot(coords.x - shapeStart.x, coords.y - shapeStart.y))))
                                        : Draw.getCircle(shapeStart, Math.max(0, Math.round(Math.hypot(coords.x - shapeStart.x, coords.y - shapeStart.y))))
                            const colorIdx = activeColorIndex
                            const changed = applyDrawing(points, colorIdx)
                            if (changed) recordHistoryIfChanged('Tile: Shape')
                        }
                        setShapeStart(null)
                        setShapePreview([])
                        setShapeFill(false)
                        return
                    }
                    if (isDrawing && strokeChangedRef.current) {
                        recordHistoryDebounced('Tile: Draw')
                        strokeChangedRef.current = false
                    }
                    setIsDrawing(false)
                    setLastPoint(null)
                },
                onPointerLeave: () => {
                    if (isDrawing && strokeChangedRef.current) {
                        recordHistoryDebounced('Tile: Draw')
                        strokeChangedRef.current = false
                    }
                    setIsDrawing(false)
                    setLastPoint(null)
                    setShapeStart(null)
                    setShapePreview([])
                    setShapeFill(false)
                }
            }}
        >
            <canvas ref={canvasRef} className="block shadow-inner" />
        </CanvasViewport>
    )
}
