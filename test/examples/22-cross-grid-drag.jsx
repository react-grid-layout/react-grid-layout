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

// ============================================================================
// Initial Data
// ============================================================================

const INITIAL_GRIDS = [
  {
    id: "grid-1",
    label: "Grid 1",
    layout: [
      { i: "a", x: 0, y: 0, w: 2, h: 2 },
      { i: "b", x: 2, y: 0, w: 2, h: 1 },
      { i: "c", x: 0, y: 2, w: 2, h: 1 },
      { i: "d", x: 2, y: 1, w: 2, h: 2 }
    ]
  },
  {
    id: "grid-2",
    label: "Grid 2",
    layout: [
      { i: "e", x: 0, y: 0, w: 4, h: 1 },
      { i: "f", x: 0, y: 1, w: 2, h: 2 },
      { i: "g", x: 2, y: 1, w: 2, h: 1 }
    ]
  },
  {
    id: "grid-3",
    label: "Grid 3",
    layout: [
      { i: "h", x: 0, y: 0, w: 2, h: 2 },
      { i: "i", x: 2, y: 0, w: 2, h: 2 },
      { i: "j", x: 0, y: 2, w: 4, h: 1 }
    ]
  },
  {
    id: "grid-4",
    label: "Grid 4",
    layout: [
      { i: "k", x: 0, y: 0, w: 2, h: 1 },
      { i: "l", x: 2, y: 0, w: 2, h: 2 },
      { i: "m", x: 0, y: 1, w: 2, h: 2 }
    ]
  }
];

// ============================================================================
// GridColumn sub-component
//
// Each grid lives in its own component so that useContainerWidth (a hook) can
// be called once per grid without violating the rules of hooks.  Cross-grid
// config and children are memoized here to avoid unnecessary re-renders of the
// underlying GridLayout.
// ============================================================================

function GridColumn({ gridId, label, layout, onUpdateGrid }) {
  const { width, containerRef, mounted } = useContainerWidth();

  const crossGridConfig = useMemo(
    () => ({
      gridId,
      onItemDraggedOut: item => {
        onUpdateGrid(gridId, prev => prev.filter(l => l.i !== item.i));
      },
      onItemDroppedIn: (_item, newLayout) => {
        onUpdateGrid(gridId, () => newLayout);
      }
    }),
    [gridId, onUpdateGrid]
  );

  const handleLayoutChange = useCallback(
    newLayout => {
      onUpdateGrid(gridId, () => newLayout);
    },
    [gridId, onUpdateGrid]
  );

  const children = useMemo(
    () =>
      layout.map(l => (
        <div key={l.i} style={cardStyle}>
          <span className="text">{"Card " + l.i.toUpperCase()}</span>
        </div>
      )),
    [layout]
  );

  return (
    <div style={columnStyle}>
      <h3 style={headingStyle}>{label}</h3>
      <div ref={containerRef}>
        {mounted && (
          <GridLayout
            width={width}
            layout={layout}
            onLayoutChange={handleLayoutChange}
            crossGridConfig={crossGridConfig}
            gridConfig={{ cols: 4, rowHeight: 80 }}
          >
            {children}
          </GridLayout>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Example
// ============================================================================

/**
 * Example 22: Cross-Grid Drag-and-Drop (N grids)
 *
 * Demonstrates dragging items freely between any number of independent
 * GridLayout instances wrapped in a single CrossGridDragProvider.
 *
 * HOW IT WORKS:
 * -------------
 * Wrap all grids in a <CrossGridDragProvider> and give each a unique
 * `crossGridConfig.gridId`.  The provider coordinates drag state so that:
 *
 *   1. When you start dragging in any grid, peer grids listen for incoming drags.
 *   2. When the cursor enters a peer grid, a ghost placeholder appears.
 *   3. On release, the item moves from the source to the target layout.
 *   4. The source grid immediately reorders to close the gap as you leave it.
 *
 * KEY REQUIREMENTS:
 * -----------------
 * - `dragConfig.bounded` must be `false` (the default).
 * - Each grid needs a unique `gridId` within the same provider.
 */
export default function CrossGridDragExample() {
  // Single piece of state drives all grids — an array of { id, label, layout }.
  const [grids, setGrids] = useState(INITIAL_GRIDS);

  // Stable updater: update one grid's layout without replacing unrelated grids.
  const onUpdateGrid = useCallback((gridId, updater) => {
    setGrids(prev =>
      prev.map(g => (g.id === gridId ? { ...g, layout: updater(g.layout) } : g))
    );
  }, []);

  return (
    <CrossGridDragProvider>
      <div style={containerStyle}>
        {grids.map((grid, idx) => (
          <React.Fragment key={grid.id}>
            {idx > 0 && <div style={dividerStyle} />}
            <GridColumn
              gridId={grid.id}
              label={grid.label}
              layout={grid.layout}
              onUpdateGrid={onUpdateGrid}
            />
          </React.Fragment>
        ))}
      </div>
    </CrossGridDragProvider>
  );
}
