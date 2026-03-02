import React, { useRef, useEffect, useState, useCallback } from 'react'
import { useProjectStore } from '../../stores/projectStore'
import { useEditorStore } from '../../stores/editorStore'
import * as Draw from '../../utils/drawingAlgorithms'
import { getThemeCanvasColors } from '../../utils/themeColors'
import { CanvasViewport } from '../common/CanvasViewport'

export const MapCanvas: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const {
        platform, tileset, selectedMapId, maps, selectedTileId, updateMap,
        recordHistoryIfChanged, recordHistoryDebounced
    } = useProjectStore()
    const {
        mapZoom: zoom, setMapZoom: setZoom,
        selectedTool, selectedLayerId,
        selectedCollisionId, selectedObjectId,
        mapGridSettings, showMapGrid,
        brushSize, brushShape,
        themeId
    } = useEditorStore()

    const [offset, setOffset] = useState({ x: 0, y: 0 })
    const [isDrawing, setIsDrawing] = useState(false)
    const [isPanning, setIsPanning] = useState(false)
    const [cursorPos, setCursorPos] = useState<Draw.Point | null>(null)
    const [lastPoint, setLastPoint] = useState<Draw.Point | null>(null)
    const [shapeStart, setShapeStart] = useState<Draw.Point | null>(null)
    const [shapePreview, setShapePreview] = useState<Draw.Point[]>([])
    const [shapeFill, setShapeFill] = useState(false)
    const [selectionStart, setSelectionStart] = useState<Draw.Point | null>(null)
    const [selectionEnd, setSelectionEnd] = useState<Draw.Point | null>(null)
    const [selectionClipboard, setSelectionClipboard] = useState<{ data: number[]; width: number; height: number; layerType: string } | null>(null)
    const [cursorCell, setCursorCell] = useState<Draw.Point | null>(null)
    const strokeChangedRef = useRef(false)
    const [selectionDragOffset, setSelectionDragOffset] = useState<{ x: number; y: number } | null>(null)
    const [selectionDragOrigin, setSelectionDragOrigin] = useState<{ xMin: number; yMin: number; xMax: number; yMax: number; data: number[] } | null>(null)
    const [selectionDragStart, setSelectionDragStart] = useState<Draw.Point | null>(null)

    const layerCacheRef = useRef(new Map<string, { dataRef: number[]; canvas: HTMLCanvasElement; type: string; visible: boolean }>())

    const activeMap = maps.find(m => m.id === selectedMapId)
    const activeLayer = activeMap?.layers.find(l => l.id === selectedLayerId)

    const tileCanvases = React.useMemo(() => {
        if (typeof document === 'undefined') return [] as HTMLCanvasElement[]
        return tileset.tiles.map((tile) => {
            const canvas = document.createElement('canvas')
            canvas.width = tile.width
            canvas.height = tile.height
            const ctx = canvas.getContext('2d')
            if (!ctx) return canvas
            ctx.imageSmoothingEnabled = false
            tile.data.forEach((colorIdx, i) => {
                const x = i % tile.width
                const y = Math.floor(i / tile.width)
                ctx.fillStyle = platform.defaultPalette[colorIdx]
                ctx.fillRect(x, y, 1, 1)
            })
            return canvas
        })
    }, [tileset.tiles, platform.defaultPalette])

    const themeColors = React.useMemo(() => getThemeCanvasColors(), [themeId])

    const layerCanvases = React.useMemo(() => {
        if (!activeMap || typeof document === 'undefined') return [] as { id: string; visible: boolean; canvas: HTMLCanvasElement }[]

        const mapW = activeMap.width * platform.tileWidth
        const mapH = activeMap.height * platform.tileHeight
        const nextIds = new Set(activeMap.layers.map(layer => layer.id))

        const result = activeMap.layers.map((layer) => {
            const cached = layerCacheRef.current.get(layer.id)
            const sizeMismatch = cached && (cached.canvas.width !== mapW || cached.canvas.height !== mapH)
            if (cached && cached.dataRef === layer.data && cached.type === layer.type && !sizeMismatch) {
                cached.visible = layer.visible
                return { id: layer.id, visible: layer.visible, canvas: cached.canvas }
            }

            const canvas = document.createElement('canvas')
            canvas.width = mapW
            canvas.height = mapH
            const ctx = canvas.getContext('2d')
            if (!ctx) {
                layerCacheRef.current.set(layer.id, { dataRef: layer.data, canvas, type: layer.type, visible: layer.visible })
                return { id: layer.id, visible: layer.visible, canvas }
            }

            ctx.imageSmoothingEnabled = false

            if (layer.type === 'tile') {
                layer.data.forEach((val, i) => {
                    if (val === -1) return
                    const tileCanvas = tileCanvases[val]
                    if (!tileCanvas) return
                    const lx = i % activeMap.width
                    const ly = Math.floor(i / activeMap.width)
                    const px = lx * platform.tileWidth
                    const py = ly * platform.tileHeight
                    ctx.drawImage(tileCanvas, px, py)
                })
            } else if (layer.type === 'collision') {
                layer.data.forEach((val, i) => {
                    if (val === 0) return
                    const lx = i % activeMap.width
                    const ly = Math.floor(i / activeMap.width)
                    const px = lx * platform.tileWidth
                    const py = ly * platform.tileHeight
                    ctx.fillStyle = val === 1 ? themeColors.dangerFill : themeColors.warningFill
                    ctx.fillRect(px, py, platform.tileWidth, platform.tileHeight)
                })
            } else if (layer.type === 'object') {
                layer.data.forEach((val, i) => {
                    if (val === 0) return
                    const lx = i % activeMap.width
                    const ly = Math.floor(i / activeMap.width)
                    const px = lx * platform.tileWidth
                    const py = ly * platform.tileHeight
                    ctx.fillStyle = themeColors.accentFaint
                    ctx.fillRect(px + 1, py + 1, platform.tileWidth - 2, platform.tileHeight - 2)
                    ctx.strokeStyle = themeColors.accent
                    ctx.lineWidth = 1
                    ctx.strokeRect(px + 1, py + 1, platform.tileWidth - 2, platform.tileHeight - 2)
                })
            }

            layerCacheRef.current.set(layer.id, { dataRef: layer.data, canvas, type: layer.type, visible: layer.visible })
            return { id: layer.id, visible: layer.visible, canvas }
        })

        // Remove stale cache entries
        Array.from(layerCacheRef.current.keys()).forEach((id) => {
            if (!nextIds.has(id)) layerCacheRef.current.delete(id)
        })

        return result
    }, [activeMap, platform.tileWidth, platform.tileHeight, tileCanvases, themeColors])

    // Auto-select layer if invalid
    useEffect(() => {
        if (activeMap && !activeLayer && activeMap.layers.length > 0) {
            useEditorStore.getState().setSelectedLayer(activeMap.layers[activeMap.layers.length - 1].id)
        }
    }, [activeMap, activeLayer])

    const centerCanvas = useCallback(() => {
        setOffset({ x: 0, y: 0 })
    }, [])

    const handleZoomToFit = useCallback(() => {
        if (containerRef.current && activeMap) {
            const rect = containerRef.current.getBoundingClientRect()
            const padding = 64
            const availableWidth = rect.width - padding
            const availableHeight = rect.height - padding
            const mapW = activeMap.width * platform.tileWidth
            const mapH = activeMap.height * platform.tileHeight
            const fitZoom = Math.max(0.5, Math.min(32, Math.floor(Math.min(
                availableWidth / mapW,
                availableHeight / mapH
            ) * 10) / 10))
            setZoom(fitZoom)
            centerCanvas()
        }
    }, [activeMap, platform, setZoom, centerCanvas])

    useEffect(() => {
        centerCanvas()
    }, [selectedMapId, centerCanvas])

    // Keyboard Shortcut: Fit to Window
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (document.activeElement instanceof HTMLInputElement ||
                document.activeElement instanceof HTMLTextAreaElement) return

            if (e.key.toLowerCase() === 'f') {
                e.preventDefault()
                handleZoomToFit()
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [handleZoomToFit])

    // Render logic
    useEffect(() => {
        let frameId: number | null = null

        const draw = () => {
            const canvas = canvasRef.current
            if (!canvas || !activeMap) return
            const ctx = canvas.getContext('2d')
            if (!ctx) return

            const dpr = window.devicePixelRatio || 1
            const mapW = activeMap.width * platform.tileWidth
            const mapH = activeMap.height * platform.tileHeight

            canvas.width = mapW * zoom * dpr
            canvas.height = mapH * zoom * dpr
            canvas.style.width = `${mapW * zoom}px`
            canvas.style.height = `${mapH * zoom}px`

            ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
            ctx.imageSmoothingEnabled = false
            ctx.clearRect(0, 0, mapW * zoom, mapH * zoom)

            layerCanvases.forEach((layer) => {
                if (!layer.visible) return
                ctx.drawImage(layer.canvas, 0, 0, mapW * zoom, mapH * zoom)
            })

            // Grid Rendering
            if (showMapGrid && mapGridSettings.enabled) {
                ctx.strokeStyle = mapGridSettings.color
                ctx.globalAlpha = mapGridSettings.opacity
                ctx.lineWidth = 1 / dpr

                const gridSpacingX = mapGridSettings.size * zoom
                const gridSpacingY = mapGridSettings.size * zoom

                for (let x = 0; x <= mapW * zoom; x += gridSpacingX) {
                    ctx.beginPath(); ctx.moveTo(x / zoom * zoom, 0); ctx.lineTo(x / zoom * zoom, mapH * zoom); ctx.stroke()
                }
                for (let y = 0; y <= mapH * zoom; y += gridSpacingY) {
                    ctx.beginPath(); ctx.moveTo(0, y / zoom * zoom); ctx.lineTo(mapW * zoom, y / zoom * zoom); ctx.stroke()
                }
                ctx.globalAlpha = 1.0
            }

            if (cursorPos) {
                ctx.strokeStyle = themeColors.accent
                ctx.lineWidth = 2
                ctx.strokeRect(
                    cursorPos.x * platform.tileWidth * zoom,
                    cursorPos.y * platform.tileHeight * zoom,
                    platform.tileWidth * zoom,
                    platform.tileHeight * zoom
                )
            }

            if (shapePreview.length > 0 && activeLayer) {
                ctx.save()
                ctx.globalAlpha = 0.35
                ctx.fillStyle = activeLayer.type === 'collision'
                    ? themeColors.dangerStrong
                    : activeLayer.type === 'object'
                        ? themeColors.accentSoft
                        : themeColors.accentMedium
                shapePreview.forEach((p) => {
                    ctx.fillRect(
                        p.x * platform.tileWidth * zoom,
                        p.y * platform.tileHeight * zoom,
                        platform.tileWidth * zoom,
                        platform.tileHeight * zoom
                    )
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
                    xMin * platform.tileWidth * zoom + 0.5,
                    yMin * platform.tileHeight * zoom + 0.5,
                    (xMax - xMin + 1) * platform.tileWidth * zoom,
                    (yMax - yMin + 1) * platform.tileHeight * zoom
                )
                ctx.restore()
            }

            if (cursorPos && (selectedTool === 'pencil' || selectedTool === 'eraser')) {
                const radius = Math.floor(Math.max(1, brushSize) / 2)
                const sizeW = (radius * 2 + 1) * platform.tileWidth * zoom
                const sizeH = (radius * 2 + 1) * platform.tileHeight * zoom
                const x = (cursorPos.x - radius) * platform.tileWidth * zoom
                const y = (cursorPos.y - radius) * platform.tileHeight * zoom
                ctx.save()
                ctx.strokeStyle = themeColors.accentStrong
                ctx.lineWidth = 1
                if (brushShape === 'circle') {
                    const r = (radius + 0.5) * platform.tileWidth * zoom
                    ctx.beginPath()
                    ctx.arc((cursorPos.x + 0.5) * platform.tileWidth * zoom, (cursorPos.y + 0.5) * platform.tileHeight * zoom, r, 0, Math.PI * 2)
                    ctx.stroke()
                } else {
                    ctx.strokeRect(x + 0.5, y + 0.5, sizeW, sizeH)
                }
                ctx.restore()
            }
        }

        frameId = window.requestAnimationFrame(draw)
        return () => {
            if (frameId) window.cancelAnimationFrame(frameId)
        }
    }, [activeMap, tileset, zoom, cursorPos, platform, mapGridSettings, showMapGrid, shapePreview, activeLayer, tileCanvases, layerCanvases, themeColors])

    const getCellCoords = (e: React.PointerEvent | PointerEvent) => {
        const canvas = canvasRef.current
        if (!canvas || !activeMap) return null
        const rect = canvas.getBoundingClientRect()
        return {
            x: Math.floor((e.clientX - rect.left) / (platform.tileWidth * zoom)),
            y: Math.floor((e.clientY - rect.top) / (platform.tileHeight * zoom))
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

    const applyDrawing = (cells: Draw.Point[], value: number) => {
        if (!activeMap || !activeLayer || activeLayer.locked || !activeLayer.visible) return

        const newData = [...activeLayer.data]
        let changed = false
        const radius = Math.floor(Math.max(1, brushSize) / 2)
        cells.forEach(p => {
            for (let dy = -radius; dy <= radius; dy++) {
                for (let dx = -radius; dx <= radius; dx++) {
                    if (brushShape === 'circle' && (dx * dx + dy * dy) > (radius * radius)) continue
                    const x = p.x + dx
                    const y = p.y + dy
                    if (x >= 0 && x < activeMap.width && y >= 0 && y < activeMap.height) {
                        const idx = y * activeMap.width + x
                        if (newData[idx] !== value) {
                            newData[idx] = value
                            changed = true
                        }
                    }
                }
            }
        })

        if (changed) {
            const newLayers = activeMap.layers.map(l => l.id === activeLayer.id ? { ...l, data: newData } : l)
            updateMap(activeMap.id, { layers: newLayers })
        }
        return changed
    }

    const getEmptyValue = useCallback((layerType: string) => {
        return layerType === 'tile' ? -1 : 0
    }, [])

    const getValToPlace = useCallback((layerType: string) => {
        if (selectedTool === 'eraser') return getEmptyValue(layerType)
        if (layerType === 'tile') {
            const idx = tileset.tiles.findIndex(t => t.id === selectedTileId)
            return idx === -1 ? 0 : idx
        }
        if (layerType === 'collision') return selectedCollisionId
        if (layerType === 'object') return selectedObjectId
        return 0
    }, [selectedTool, selectedTileId, tileset.tiles, selectedCollisionId, selectedObjectId, getEmptyValue])

    const handlePointerDown = (e: React.PointerEvent) => {
        if (e.button !== 0 || isPanning) return
        const coords = getCellCoords(e)
        if (!coords || !activeLayer || !activeMap) return

        if (selectedTool === 'select') {
            const bounds = getSelectionBounds()
            if (bounds && coords.x >= bounds.xMin && coords.x <= bounds.xMax && coords.y >= bounds.yMin && coords.y <= bounds.yMax) {
                const data: number[] = []
                for (let y = bounds.yMin; y <= bounds.yMax; y++) {
                    for (let x = bounds.xMin; x <= bounds.xMax; x++) {
                        data.push(activeLayer.data[y * activeMap.width + x])
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

        if (selectedTool === 'picker') {
            const val = activeLayer.data[coords.y * activeMap.width + coords.x]
            if (activeLayer.type === 'tile') {
                const tile = tileset.tiles[val]
                if (tile) useProjectStore.getState().selectTile(tile.id)
            } else if (activeLayer.type === 'collision') {
                useEditorStore.getState().setSelectedCollisionId(val)
            } else if (activeLayer.type === 'object') {
                useEditorStore.getState().setSelectedObjectId(val)
            }
            return
        }

        const valToPlace = getValToPlace(activeLayer.type)

        if (selectedTool === 'line' || selectedTool === 'rect' || selectedTool === 'circle') {
            setShapeStart(coords)
            setShapeFill((selectedTool === 'rect' || selectedTool === 'circle') && e.shiftKey)
            setShapePreview([coords])
            return
        }

        if (selectedTool === 'fill') {
            const fillIndices = Draw.getFloodFill(activeLayer.data, activeMap.width, activeMap.height, coords, valToPlace)
            if (fillIndices.length > 0) {
                const newData = [...activeLayer.data]
                fillIndices.forEach(idx => newData[idx] = valToPlace)
                const newLayers = activeMap.layers.map(l => l.id === activeLayer.id ? { ...l, data: newData } : l)
                updateMap(activeMap.id, { layers: newLayers })
                recordHistoryIfChanged('Map: Fill')
            }
        } else {
            setIsDrawing(true)
            strokeChangedRef.current = false
            setLastPoint(coords)
            const changed = applyDrawing([coords], valToPlace)
            if (changed) strokeChangedRef.current = true
        }
    }

    const handlePointerMove = (e: React.PointerEvent) => {
        const coords = getCellCoords(e)
        if (!coords) return
        setCursorCell(coords)

        if (coords.x !== cursorPos?.x || coords.y !== cursorPos?.y) {
            setCursorPos(coords)
        }

        if (selectedTool === 'select' && selectionStart) {
            if (selectionDragStart && selectionDragOrigin) {
                setSelectionDragOffset({
                    x: coords.x - selectionDragStart.x,
                    y: coords.y - selectionDragStart.y
                })
            } else {
                setSelectionEnd(coords)
            }
            return
        }

        if (selectedTool !== 'select' && shapeStart) {
            const fill = (selectedTool === 'rect' || selectedTool === 'circle') && e.shiftKey
            setShapeFill(fill)
            const cells = selectedTool === 'line'
                ? Draw.getBresenhamLine(shapeStart, coords)
                : selectedTool === 'rect'
                    ? Draw.getRectangle(shapeStart, coords, fill)
                    : fill
                        ? Draw.getFilledCircle(shapeStart, Math.max(0, Math.round(Math.hypot(coords.x - shapeStart.x, coords.y - shapeStart.y))))
                        : Draw.getCircle(shapeStart, Math.max(0, Math.round(Math.hypot(coords.x - shapeStart.x, coords.y - shapeStart.y))))
            setShapePreview(cells)
            return
        }

        if (isDrawing && lastPoint && activeLayer) {
            const valToPlace = getValToPlace(activeLayer.type)
            const cells = Draw.getBresenhamLine(lastPoint, coords)
            const changed = applyDrawing(cells, valToPlace)
            if (changed) strokeChangedRef.current = true
            setLastPoint(coords)
        }
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

            if (!activeLayer || !activeMap) return

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
                            data.push(activeLayer.data[y * activeMap.width + x])
                        }
                    }
                    setSelectionClipboard({ data, width, height, layerType: activeLayer.type })
                    return
                }

                if (e.key.toLowerCase() === 'x') {
                    e.preventDefault()
                    const { xMin, yMin, xMax, yMax } = bounds
                    const width = xMax - xMin + 1
                    const height = yMax - yMin + 1
                    const data: number[] = []
                    const newData = [...activeLayer.data]
                    const emptyValue = getEmptyValue(activeLayer.type)
                    for (let y = yMin; y <= yMax; y++) {
                        for (let x = xMin; x <= xMax; x++) {
                            data.push(activeLayer.data[y * activeMap.width + x])
                            newData[y * activeMap.width + x] = emptyValue
                        }
                    }
                    const newLayers = activeMap.layers.map(l => l.id === activeLayer.id ? { ...l, data: newData } : l)
                    updateMap(activeMap.id, { layers: newLayers })
                    recordHistoryIfChanged('Map: Cut')
                    setSelectionClipboard({ data, width, height, layerType: activeLayer.type })
                    return
                }
            }

            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v' && selectionClipboard) {
                e.preventDefault()
                if (selectionClipboard.layerType !== activeLayer.type) return
                const target = cursorCell || selectionStart
                if (!target) return
                const newData = [...activeLayer.data]
                for (let y = 0; y < selectionClipboard.height; y++) {
                    for (let x = 0; x < selectionClipboard.width; x++) {
                        const dx = target.x + x
                        const dy = target.y + y
                        if (dx >= 0 && dx < activeMap.width && dy >= 0 && dy < activeMap.height) {
                            const value = selectionClipboard.data[y * selectionClipboard.width + x]
                            newData[dy * activeMap.width + dx] = value
                        }
                    }
                }
                const newLayers = activeMap.layers.map(l => l.id === activeLayer.id ? { ...l, data: newData } : l)
                updateMap(activeMap.id, { layers: newLayers })
                recordHistoryIfChanged('Map: Paste')
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [activeLayer, activeMap, selectionStart, selectionEnd, selectionClipboard, cursorCell, recordHistoryIfChanged, updateMap])

    if (!activeMap) {
        return <div className="flex-1 flex items-center justify-center text-gray-500 italic">Select a map in the sidebar to start editing</div>
    }

    const infoContent = (
        <div className="flex flex-col gap-1 p-1 min-w-[120px]">
            <div className="flex justify-between items-center gap-4">
                <span className="text-gray-500 font-bold uppercase tracking-widest text-[8px]">Map</span>
                <span className="text-gray-200 font-medium text-[10px] truncate max-w-[80px]">{activeMap.name}</span>
            </div>
            <div className="h-px bg-white/5 my-0.5" />
            <div className="flex justify-between items-center gap-4">
                <span className="text-gray-500 font-bold uppercase tracking-widest text-[8px]">Layer</span>
                <span className="text-accent-primary font-bold uppercase text-[10px]">{activeLayer?.name || 'None'}</span>
            </div>
            <div className="h-px bg-white/5 my-0.5" />
            <div className="flex justify-between items-center gap-4">
                <span className="text-gray-500 font-bold uppercase tracking-widest text-[8px]">Index</span>
                <span className="text-gray-200 font-mono text-[10px]">
                    {cursorPos ? activeLayer?.data[cursorPos.y * activeMap.width + cursorPos.x] ?? '∅' : '∅'}
                </span>
            </div>
            <div className="h-px bg-white/5 my-0.5" />
            <div className="flex justify-between items-center gap-4">
                <span className="text-gray-500 font-bold uppercase tracking-widest text-[8px]">Size</span>
                <span className="text-gray-200 font-mono text-[10px]">{activeMap.width}x{activeMap.height}</span>
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
            zoomMin={0.2}
            zoomMax={32}
            offset={offset}
            setOffset={setOffset}
            onZoomToFit={handleZoomToFit}
            onPanningChange={setIsPanning}
            cursorClassName={isPanning ? "cursor-grabbing" : (selectedTool === 'select' ? "cursor-cell" : (selectedTool === 'fill' ? "cursor-[copy]" : "cursor-crosshair"))}
            canvasWidth={activeMap.width * platform.tileWidth * zoom}
            canvasHeight={activeMap.height * platform.tileHeight * zoom}
            infoContent={infoContent}
            formatZoomLabel={(value) => `${Math.round(value * 100)}%`}
            containerProps={{
                onPointerDown: handlePointerDown,
                onPointerMove: handlePointerMove,
                onPointerUp: (e) => {
                    if (selectedTool === 'select') {
                        const coords = getCellCoords(e as unknown as PointerEvent)
                        if (selectionDragOrigin && selectionDragOffset && activeLayer && activeMap) {
                            const { xMin, yMin, xMax, yMax, data } = selectionDragOrigin
                            const dx = selectionDragOffset.x
                            const dy = selectionDragOffset.y
                            if (dx !== 0 || dy !== 0) {
                                const newData = [...activeLayer.data]
                                const emptyValue = getEmptyValue(activeLayer.type)
                                for (let y = yMin; y <= yMax; y++) {
                                    for (let x = xMin; x <= xMax; x++) {
                                        newData[y * activeMap.width + x] = emptyValue
                                    }
                                }
                                const width = xMax - xMin + 1
                                const height = yMax - yMin + 1
                                for (let y = 0; y < height; y++) {
                                    for (let x = 0; x < width; x++) {
                                        const tx = xMin + dx + x
                                        const ty = yMin + dy + y
                                        if (tx >= 0 && tx < activeMap.width && ty >= 0 && ty < activeMap.height) {
                                            newData[ty * activeMap.width + tx] = data[y * width + x]
                                        }
                                    }
                                }
                                const newLayers = activeMap.layers.map(l => l.id === activeLayer.id ? { ...l, data: newData } : l)
                                updateMap(activeMap.id, { layers: newLayers })
                                recordHistoryIfChanged('Map: Move Selection')
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
                    if (shapeStart && activeLayer && activeMap) {
                        const coords = getCellCoords(e as unknown as PointerEvent)
                        if (coords) {
                            const cells = selectedTool === 'line'
                                ? Draw.getBresenhamLine(shapeStart, coords)
                                : selectedTool === 'rect'
                                    ? Draw.getRectangle(shapeStart, coords, shapeFill)
                                    : shapeFill
                                        ? Draw.getFilledCircle(shapeStart, Math.max(0, Math.round(Math.hypot(coords.x - shapeStart.x, coords.y - shapeStart.y))))
                                        : Draw.getCircle(shapeStart, Math.max(0, Math.round(Math.hypot(coords.x - shapeStart.x, coords.y - shapeStart.y))))
                            const valToPlace = getValToPlace(activeLayer.type)
                            const changed = applyDrawing(cells, valToPlace)
                            if (changed) recordHistoryIfChanged('Map: Shape')
                        }
                        setShapeStart(null)
                        setShapePreview([])
                        setShapeFill(false)
                        return
                    }
                    if (isDrawing && strokeChangedRef.current) {
                        recordHistoryDebounced('Map: Draw')
                        strokeChangedRef.current = false
                    }
                    setIsDrawing(false)
                    setLastPoint(null)
                },
                onPointerLeave: () => {
                    if (isDrawing && strokeChangedRef.current) {
                        recordHistoryDebounced('Map: Draw')
                        strokeChangedRef.current = false
                    }
                    setIsDrawing(false)
                    setLastPoint(null)
                    setCursorPos(null)
                    setShapeStart(null)
                    setShapePreview([])
                    setShapeFill(false)
                },
                onContextMenu: (e) => e.preventDefault()
            }}
        >
            <canvas ref={canvasRef} className="block shadow-inner" />
        </CanvasViewport>
    )
}
