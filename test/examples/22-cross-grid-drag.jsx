import React, { useState, useMemo, useCallback } from "react";
import {
  GridLayout,
  CrossGridDragProvider,
  useContainerWidth
} from "react-grid-layout";

// ============================================================================
// Styles
// ============================================================================

const containerStyle = {
  display: "flex",
  gap: 0,
  alignItems: "flex-start"
};

const columnStyle = {
  flex: 1,
  minWidth: 0
};

const dividerStyle = {
  width: 2,
  alignSelf: "stretch",
  background: "#ddd",
  margin: "0 8px",
  flexShrink: 0
};

const headingStyle = {
  margin: "0 0 8px 0",
  textAlign: "center",
  color: "#555",
  fontWeight: 600
};

const cardStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
  gap: 4
};

/**
 * Example 22: Cross-Grid Drag-and-Drop
 *
 * This example demonstrates how to drag items seamlessly between two
 * independent GridLayout instances using the CrossGridDragProvider.
 *
 * HOW IT WORKS:
 * -------------
 * Wrap both grids in a <CrossGridDragProvider>.  Give each grid a unique
 * `crossGridConfig.gridId`.  The provider coordinates drag state between them:
 *
 *   1. When you start dragging an item in the LEFT grid, the provider
 *      publishes the cursor position on every frame.
 *   2. When the cursor enters the RIGHT grid, a ghost placeholder appears
 *      showing where the item will land.
 *   3. When you release, the item is removed from the source layout and
 *      added to the target layout at the ghost's position.
 *
 * CALLBACKS:
 * ----------
 * - `onItemDraggedOut(item)`: called on the SOURCE grid after a successful
 *   transfer.  Use it to remove the item from your external state.
 * - `onItemDroppedIn(item, layout)`: called on the TARGET grid after the
 *   drop.  The `layout` argument is the full updated target layout.
 *   Use it to sync your external state.
 * - `onLayoutChange(layout)`: fires on each grid for normal layout changes
 *   (drag within the same grid, resize, etc.) — use it as you normally would.
 *
 * REQUIREMENTS:
 * -------------
 * - `dragConfig.bounded` must be `false` (the default) so items can
 *   visually leave the source grid container during the drag.
 * - Each grid needs a unique `gridId` within the same provider.
 *
 * TRY IT:
 * -------
 * 1. Drag any card from the left grid and drop it on the right, and vice versa.
 * 2. Watch the ghost placeholder indicate the target drop position.
 * 3. Notice that other items in the target grid move aside to make room.
 */
export default function CrossGridDragExample(props) {
  // Use two separate container width measurements — one per grid column.
  const {
    width: leftWidth,
    containerRef: leftContainerRef,
    mounted: leftMounted
  } = useContainerWidth();
  const {
    width: rightWidth,
    containerRef: rightContainerRef,
    mounted: rightMounted
  } = useContainerWidth();

  // ============================================================================
  // Layout State
  // ============================================================================

  const [leftLayout, setLeftLayout] = useState([
    { i: "a", x: 0, y: 0, w: 2, h: 2 },
    { i: "b", x: 2, y: 0, w: 2, h: 1 },
    { i: "c", x: 0, y: 2, w: 2, h: 1 },
    { i: "d", x: 2, y: 1, w: 2, h: 2 },
    { i: "e", x: 0, y: 3, w: 4, h: 1 }
  ]);

  const [rightLayout, setRightLayout] = useState([
    { i: "f", x: 0, y: 0, w: 2, h: 2 },
    { i: "g", x: 2, y: 0, w: 2, h: 1 },
    { i: "h", x: 2, y: 1, w: 2, h: 2 }
  ]);

  // ============================================================================
  // Cross-Grid Config
  // ============================================================================

  const leftCrossGridConfig = useMemo(
    () => ({
      gridId: "left",
      // Item was successfully dragged to the right grid — remove it from left.
      onItemDraggedOut: item => {
        setLeftLayout(prev => prev.filter(l => l.i !== item.i));
      },
      // An item came in from the right grid — sync the updated layout.
      onItemDroppedIn: (_item, layout) => {
        setLeftLayout(layout);
        props.onLayoutChange?.(layout);
      }
    }),
    []
  );

  const rightCrossGridConfig = useMemo(
    () => ({
      gridId: "right",
      onItemDraggedOut: item => {
        setRightLayout(prev => prev.filter(l => l.i !== item.i));
      },
      onItemDroppedIn: (_item, layout) => {
        setRightLayout(layout);
        props.onLayoutChange?.(layout);
      }
    }),
    []
  );

  // ============================================================================
  // Children (memoized — GridLayout uses reference equality for optimization)
  // ============================================================================

  const cardLabels = {
    a: "Card A",
    b: "Card B",
    c: "Card C",
    d: "Card D",
    e: "Card E (wide)",
    f: "Card F",
    g: "Card G",
    h: "Card H"
  };

  const leftChildren = useMemo(
    () =>
      leftLayout.map(l => (
        <div key={l.i} style={cardStyle}>
          <span className="text">{cardLabels[l.i] ?? l.i}</span>
          <small style={{ opacity: 0.6, fontSize: 11 }}>drag me →</small>
        </div>
      )),
    [leftLayout]
  );

  const rightChildren = useMemo(
    () =>
      rightLayout.map(l => (
        <div key={l.i} style={cardStyle}>
          <span className="text">{cardLabels[l.i] ?? l.i}</span>
          <small style={{ opacity: 0.6, fontSize: 11 }}>← drag me</small>
        </div>
      )),
    [rightLayout]
  );

  // ============================================================================
  // Layout Change Handlers
  // ============================================================================

  const handleLeftLayoutChange = useCallback(
    layout => {
      setLeftLayout(layout);
      props.onLayoutChange?.(layout);
    },
    [props]
  );

  const handleRightLayoutChange = useCallback(
    layout => {
      setRightLayout(layout);
    },
    []
  );

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <CrossGridDragProvider>
      <div style={containerStyle}>
        {/* Left Grid */}
        <div style={columnStyle}>
          <h3 style={headingStyle}>Left Grid</h3>
          <div ref={leftContainerRef}>
            {leftMounted && (
              <GridLayout
                width={leftWidth}
                layout={leftLayout}
                onLayoutChange={handleLeftLayoutChange}
                crossGridConfig={leftCrossGridConfig}
                gridConfig={{ cols: 4, rowHeight: 80 }}
              >
                {leftChildren}
              </GridLayout>
            )}
          </div>
        </div>

        {/* Divider */}
        <div style={dividerStyle} />

        {/* Right Grid */}
        <div style={columnStyle}>
          <h3 style={headingStyle}>Right Grid</h3>
          <div ref={rightContainerRef}>
            {rightMounted && (
              <GridLayout
                width={rightWidth}
                layout={rightLayout}
                onLayoutChange={handleRightLayoutChange}
                crossGridConfig={rightCrossGridConfig}
                gridConfig={{ cols: 4, rowHeight: 80 }}
              >
                {rightChildren}
              </GridLayout>
            )}
          </div>
        </div>
      </div>
    </CrossGridDragProvider>
  );
}
