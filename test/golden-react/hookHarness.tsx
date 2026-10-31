import React, { useCallback } from "react";
import { GridItem } from "../../src/react/components/GridItem";
import {
  useGridLayout,
  type UseGridLayoutResult
} from "../../src/react/hooks/useGridLayout";
import type {
  Compactor,
  GridDragEvent,
  GridResizeEvent,
  Layout
} from "../../src/core/types";
import { nodeId, type withRecorder } from "./recorder";

export const hookGridConfig = {
  cols: 6,
  rowHeight: 30,
  margin: [10, 10] as [number, number],
  containerPadding: [0, 0] as [number, number],
  maxRows: 20
};

type Recorder = ReturnType<typeof withRecorder>;
export interface HookGridProps {
  layout: Layout;
  compactor: Compactor;
  recorder: Recorder;
  observe: (api: UseGridLayoutResult) => void;
  children: React.ReactElement[];
  cols?: number;
  width?: number;
  preventCollision?: boolean;
}

/** Consumer assembly using only the hook's public state and real GridItems.
 * GridItem events are notes, since the hook exposes only onLayoutChange.
 * No GridLayout callback semantics are manufactured by this adapter.
 */
export function HookGrid({
  layout,
  compactor,
  recorder,
  observe,
  children,
  cols = hookGridConfig.cols,
  width = 600,
  preventCollision = false
}: HookGridProps) {
  const grid = useGridLayout({
    layout,
    cols,
    compactor,
    preventCollision,
    onLayoutChange: recorder.props.onLayoutChange
  });
  observe(grid);
  const {
    onDragStart: startDrag,
    onDrag: moveDrag,
    onDragStop: stopDrag,
    onResizeStart: startResize,
    onResize: moveResize,
    onResizeStop: stopResize
  } = grid;

  const onDragStart = useCallback(
    (id: string, x: number, y: number, data: GridDragEvent) => {
      recorder.note({
        gridItemEvent: "onDragStart",
        id,
        x,
        y,
        eventType: data.e.type,
        node: nodeId(data.node)
      });
      startDrag(id, x, y);
    },
    [startDrag, recorder]
  );
  const onDrag = useCallback(
    (id: string, x: number, y: number, data: GridDragEvent) => {
      recorder.note({
        gridItemEvent: "onDrag",
        id,
        x,
        y,
        eventType: data.e.type,
        node: nodeId(data.node)
      });
      moveDrag(id, x, y);
    },
    [moveDrag, recorder]
  );
  const onDragStop = useCallback(
    (id: string, x: number, y: number, data: GridDragEvent) => {
      recorder.note({
        gridItemEvent: "onDragStop",
        id,
        x,
        y,
        eventType: data.e.type,
        node: nodeId(data.node)
      });
      stopDrag(id, x, y);
    },
    [stopDrag, recorder]
  );
  const onResizeStart = useCallback(
    (id: string, w: number, h: number, data: GridResizeEvent) => {
      recorder.note({
        gridItemEvent: "onResizeStart",
        id,
        w,
        h,
        handle: data.handle,
        eventType: data.e.type,
        node: nodeId(data.node)
      });
      startResize(id);
    },
    [startResize, recorder]
  );
  const onResize = useCallback(
    (id: string, w: number, h: number, data: GridResizeEvent) => {
      recorder.note({
        gridItemEvent: "onResize",
        id,
        w,
        h,
        handle: data.handle,
        eventType: data.e.type,
        node: nodeId(data.node)
      });
      // The public hook accepts optional x/y but offers no handle geometry.
      // This assembly forwards the dimensions emitted by the real GridItem.
      moveResize(id, w, h);
    },
    [moveResize, recorder]
  );
  const onResizeStop = useCallback(
    (id: string, w: number, h: number, data: GridResizeEvent) => {
      recorder.note({
        gridItemEvent: "onResizeStop",
        id,
        w,
        h,
        handle: data.handle,
        eventType: data.e.type,
        node: nodeId(data.node)
      });
      stopResize(id, w, h);
    },
    [stopResize, recorder]
  );

  const common = {
    containerWidth: width,
    cols,
    margin: hookGridConfig.margin,
    containerPadding: hookGridConfig.containerPadding,
    maxRows: hookGridConfig.maxRows,
    rowHeight: hookGridConfig.rowHeight,
    isBounded: false,
    useCSSTransforms: true,
    layout: grid.layout
  };
  const active = grid.dragState.activeDrag;
  const height = grid.containerHeight * 40 - 10;

  return (
    <div className="react-grid-layout" style={{ height }}>
      {children.map(child => {
        const item = grid.layout.find(entry => entry.i === child.key);
        if (!item) return null;
        return (
          <GridItem
            {...common}
            {...item}
            key={item.i}
            layoutItem={item}
            isDraggable={item.isDraggable ?? !item.static}
            isResizable={item.isResizable ?? !item.static}
            dragThreshold={0}
            resizeHandles={item.resizeHandles ?? ["se", "n"]}
            onDragStart={onDragStart}
            onDrag={onDrag}
            onDragStop={onDragStop}
            onResizeStart={onResizeStart}
            onResize={onResize}
            onResizeStop={onResizeStop}
          >
            {child}
          </GridItem>
        );
      })}
      {active && (
        <GridItem
          {...common}
          {...active}
          isDraggable={false}
          isResizable={false}
          className="react-grid-placeholder"
        >
          <div />
        </GridItem>
      )}
    </div>
  );
}

export function hookState(api: UseGridLayoutResult) {
  return {
    layout: api.layout,
    dragState: api.dragState,
    resizeState: api.resizeState,
    dropState: {
      hasNode: api.dropState.droppingDOMNode !== null,
      position: api.dropState.droppingPosition && {
        left: api.dropState.droppingPosition.left,
        top: api.dropState.droppingPosition.top,
        eventType: api.dropState.droppingPosition.e.type
      }
    },
    containerHeight: api.containerHeight,
    isInteracting: api.isInteracting
  };
}
