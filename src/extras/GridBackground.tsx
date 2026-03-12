/**
 * GridBackground component
 *
 * Renders an SVG grid background that aligns with GridLayout cells.
 * Use this to visualize the grid structure behind your layout.
 */

import * as React from "react";
import { useMemo } from "react";
import { calcGridCellDimensions } from "../core/calculate.js";
import type { GridCellConfig } from "../core/calculate.js";

export interface GridBackgroundProps extends GridCellConfig {
  /**
   * Number of rows to display. If "auto", calculates based on height.
   * @default 10
   */
  rows?: number | "auto";

  /**
   * Height of the background in pixels. Used when rows="auto".
   */
  height?: number;

  /**
   * Color of the grid cell backgrounds.
   * @default "#e0e0e0"
   */
  color?: string;

  /**
   * Border radius of grid cells in pixels.
   * @default 4
   */
  borderRadius?: number;

  /**
   * Additional CSS class name.
   */
  className?: string;

  /**
   * Additional inline styles.
   */
  style?: React.CSSProperties;
}

/**
 * SVG grid background component.
 *
 * Renders a visual grid that aligns with GridLayout cells. Position this
 * behind your GridLayout using CSS positioning.
 *
 * @example
 * ```tsx
 * import { GridBackground } from 'react-grid-layout/extras';
 *
 * function MyGrid() {
 *   const { width, containerRef, mounted } = useContainerWidth();
 *
 *   return (
 *     <div ref={containerRef} style={{ position: 'relative' }}>
 *       {mounted && (
 *         <>
 *           <GridBackground
 *             width={width}
 *             cols={12}
 *             rowHeight={30}
 *             margin={[10, 10]}
 *             rows={10}
 *             color="#f0f0f0"
 *           />
 *           <GridLayout width={width} gridConfig={{ cols: 12, rowHeight: 30 }}>
 *             {children}
 *           </GridLayout>
 *         </>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function GridBackground({
  width,
  cols,
  rowHeight,
  margin = [10, 10],
  containerPadding,
  rows = 10,
  height,
  color = "#e0e0e0",
  borderRadius = 4,
  className,
  style
}: GridBackgroundProps): React.ReactElement {
  const dims = useMemo(
    () =>
      calcGridCellDimensions({
        width,
        cols,
        rowHeight,
        margin,
        containerPadding
      }),
    [width, cols, rowHeight, margin, containerPadding]
  );

  // Calculate number of rows
  const rowCount = useMemo(() => {
    if (rows !== "auto") return rows;
    if (height) {
      // Calculate rows that fit in the given height
      const padding = containerPadding ?? margin;
      return Math.ceil(
        (height - padding[1] * 2 + margin[1]) / (rowHeight + margin[1])
      );
    }
    return 10;
  }, [rows, height, rowHeight, margin, containerPadding]);

  // Calculate total height
  const totalHeight = useMemo(() => {
    const padding = containerPadding ?? margin;
    return padding[1] * 2 + rowCount * rowHeight + (rowCount - 1) * margin[1];
  }, [rowCount, rowHeight, margin, containerPadding]);

  // Generate cell rectangles
  const cells = useMemo(() => {
    const rects: React.ReactElement[] = [];
    const { cellWidth, cellHeight, offsetX, offsetY, gapX, gapY } = dims;

    for (let row = 0; row < rowCount; row++) {
      for (let col = 0; col < cols; col++) {
        const x = offsetX + col * (cellWidth + gapX);
        const y = offsetY + row * (cellHeight + gapY);

        rects.push(
          <rect
            key={`${row}-${col}`}
            x={x}
            y={y}
            width={cellWidth}
            height={cellHeight}
            rx={borderRadius}
            ry={borderRadius}
            fill={color}
          />
        );
      }
    }

    return rects;
  }, [dims, rowCount, cols, borderRadius, color]);

  return (
    <svg
      className={className}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: width,
        height: totalHeight,
        pointerEvents: "none",
        ...style
      }}
      aria-hidden="true"
    >
      {cells}
    </svg>
  );
}

export default GridBackground;
