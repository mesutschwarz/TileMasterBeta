/**
 * Core drawing algorithms for pixel art.
 * Standard algorithms like Bresenham's and Scanline Flood Fill.
 */

export interface Point {
    x: number;
    y: number;
}

/**
 * Bresenham's Line Algorithm
 */
export function getBresenhamLine(start: Point, end: Point): Point[] {
    const points: Point[] = [];
    let x0 = Math.floor(start.x);
    let y0 = Math.floor(start.y);
    const x1 = Math.floor(end.x);
    const y1 = Math.floor(end.y);

    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;

    let done = false;
    while (!done) {
        points.push({ x: x0, y: y0 });
        if (x0 === x1 && y0 === y1) {
            done = true;
            continue;
        }
        const e2 = 2 * err;
        if (e2 > -dy) {
            err -= dy;
            x0 += sx;
        }
        if (e2 < dx) {
            err += dx;
            y0 += sy;
        }
    }
    return points;
}

/**
 * Pixel-Perfect Line Algorithm (removes L-shaped jaggies)
 */
export function getPixelPerfectLine(start: Point, end: Point): Point[] {
    const line = getBresenhamLine(start, end);
    if (line.length < 3) return line;

    const result: Point[] = [line[0]];
    for (let i = 1; i < line.length - 1; i++) {
        const prev = line[i - 1];
        const curr = line[i];
        const next = line[i + 1];

        // If it's an L-shape (diagonal move followed by horizontal/vertical)
        // or just redundant pixels in a tight stair, we skip the middle one.
        if (prev.x !== next.x && prev.y !== next.y) {
            // Diagonal move! Check if "curr" is redundant
            // (Standard pixel perfect check: if curr shares X with prev and Y with next, or vice-versa)
            if ((curr.x === prev.x && curr.y === next.y) || (curr.x === next.x && curr.y === prev.y)) {
                continue;
            }
        }
        result.push(curr);
    }
    result.push(line[line.length - 1]);
    return result;
}

/**
 * Midpoint Circle Algorithm
 */
export function getCircle(center: Point, radius: number): Point[] {
    const points: Point[] = [];
    let x = radius;
    let y = 0;
    let err = 0;

    const addOctants = (cx: number, cy: number, x: number, y: number) => {
        points.push({ x: cx + x, y: cy + y });
        points.push({ x: cx + y, y: cy + x });
        points.push({ x: cx - y, y: cy + x });
        points.push({ x: cx - x, y: cy + y });
        points.push({ x: cx - x, y: cy - y });
        points.push({ x: cx - y, y: cy - x });
        points.push({ x: cx + y, y: cy - x });
        points.push({ x: cx + x, y: cy - y });
    };

    while (x >= y) {
        addOctants(center.x, center.y, x, y);
        if (err <= 0) {
            y += 1;
            err += 2 * y + 1;
        }
        if (err > 0) {
            x -= 1;
            err -= 2 * x + 1;
        }
    }
    return points;
}

/**
 * Filled Circle Algorithm
 */
export function getFilledCircle(center: Point, radius: number): Point[] {
    const points: Point[] = [];
    const r2 = radius * radius;

    for (let y = -radius; y <= radius; y++) {
        for (let x = -radius; x <= radius; x++) {
            if ((x * x + y * y) <= r2) {
                points.push({ x: center.x + x, y: center.y + y });
            }
        }
    }

    return points;
}

/**
 * Rectangle Algorithm
 */
export function getRectangle(start: Point, end: Point, fill: boolean = false): Point[] {
    const points: Point[] = [];
    const xMin = Math.min(start.x, end.x);
    const xMax = Math.max(start.x, end.x);
    const yMin = Math.min(start.y, end.y);
    const yMax = Math.max(start.y, end.y);

    if (fill) {
        for (let y = yMin; y <= yMax; y++) {
            for (let x = xMin; x <= xMax; x++) {
                points.push({ x, y });
            }
        }
    } else {
        // Outline only
        for (let x = xMin; x <= xMax; x++) {
            points.push({ x, y: yMin });
            points.push({ x, y: yMax });
        }
        for (let y = yMin + 1; y < yMax; y++) {
            points.push({ x: xMin, y });
            points.push({ x: xMax, y });
        }
    }
    return points;
}

/**
 * Scanline Flood Fill
 * @param data The flat array of color indices
 * @param width Canvas width
 * @param height Canvas height
 * @param start Start point
 * @param targetColor Original color to replace
 * @returns Array of indices to update
 */
export function getFloodFill(
    data: number[] | Uint8Array | Int32Array,
    width: number,
    height: number,
    start: Point,
    targetColor: number
): number[] {
    const x = Math.floor(start.x);
    const y = Math.floor(start.y);

    if (x < 0 || x >= width || y < 0 || y >= height) return [];

    const startIdx = y * width + x;
    if (data[startIdx] === targetColor) return []; // Should be different

    const originalColor = data[startIdx];
    const result: number[] = [];
    const stack: [number, number][] = [[x, y]];
    const visited = new Set<number>();

    while (stack.length > 0) {
        const [currX, currY] = stack.pop()!;
        const idx = currY * width + currX;

        if (visited.has(idx)) continue;
        visited.add(idx);

        if (data[idx] === originalColor) {
            result.push(idx);

            if (currX > 0) stack.push([currX - 1, currY]);
            if (currX < width - 1) stack.push([currX + 1, currY]);
            if (currY > 0) stack.push([currX, currY - 1]);
            if (currY < height - 1) stack.push([currX, currY + 1]);
        }
    }

    return result;
}
