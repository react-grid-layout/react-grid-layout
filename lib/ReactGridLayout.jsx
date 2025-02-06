/* @flow */
import * as React from "react";
import { deepEqual } from "fast-equals";
import clsx from "clsx";
import {
  bottom,
  childrenEqual,
  cloneLayoutItem,
  compact,
  compactType,
  fastRGLPropsEqual,
  getAllCollisions,
  getLayoutItem,
  moveElement,
  noop,
  synchronizeLayoutWithChildren,
  withLayoutItem
} from "./utils";
import { calcXY } from "./calculateUtils";
import GridItem from "./GridItem";
import ReactGridLayoutPropTypes from "./ReactGridLayoutPropTypes";
import type { ChildrenArray, MixedElement as ReactElement } from "react";
import type {
  CompactType,
  GridResizeEvent,
  GridDragEvent,
  DragOverEvent,
  Layout,
  DroppingPosition,
  LayoutItem
} from "./utils";
import type { PositionParams } from "./calculateUtils";
import type { Props, DefaultProps } from "./ReactGridLayoutPropTypes";

const layoutClassName = "react-grid-layout";
let isFirefox = false;
try {
  isFirefox = /firefox/i.test(navigator.userAgent);
} catch (e) {
  // Ignore if navigator is undefined
}

function ReactGridLayout(props: Props): ReactElement {
  // Consolidate state similar to class component state.
  const [state, setState] = React.useState(() => ({
    activeDrag: null,
    layout: synchronizeLayoutWithChildren(
      props.layout,
      props.children,
      props.cols,
      compactType(props),
      props.allowOverlap
    ),
    mounted: false,
    oldDragItem: null,
    oldLayout: null,
    oldResizeItem: null,
    resizing: false,
    droppingDOMNode: null,
    droppingPosition: undefined,
    children: props.children,
    compactType: props.compactType,
    propsLayout: props.layout
  }));

  // Ref for tracking dragEnter events (mimicking an instance variable)
  const dragEnterCounter = React.useRef(0);

  // containerHeight: calculates the pixel height of the container.
  const containerHeight = React.useCallback((): ?string => {
    if (!props.autoSize) return;
    const nbRow = bottom(state.layout);
    const containerPaddingY = props.containerPadding
      ? props.containerPadding[1]
      : props.margin[1];
    return (
      nbRow * props.rowHeight +
      (nbRow - 1) * props.margin[1] +
      containerPaddingY * 2 +
      "px"
    );
  }, [
    props.autoSize,
    state.layout,
    props.containerPadding,
    props.margin,
    props.rowHeight
  ]);

  // onLayoutMaybeChanged: calls onLayoutChange if layout has changed.
  const onLayoutMaybeChanged = React.useCallback(
    (newLayout: Layout, oldLayout: ?Layout) => {
      if (!oldLayout) oldLayout = state.layout;
      if (!deepEqual(oldLayout, newLayout)) {
        props.onLayoutChange(newLayout);
      }
    },
    [props, state.layout]
  );

  // Simulate getDerivedStateFromProps using useEffect.
  React.useEffect(() => {
    if (state.activeDrag) return;
    let newLayoutBase = null;
    if (
      !deepEqual(props.layout, state.propsLayout) ||
      props.compactType !== state.compactType
    ) {
      newLayoutBase = props.layout;
    } else if (!childrenEqual(props.children, state.children)) {
      newLayoutBase = state.layout;
    }
    if (newLayoutBase) {
      const newLayout = synchronizeLayoutWithChildren(
        newLayoutBase,
        props.children,
        props.cols,
        compactType(props),
        props.allowOverlap
      );
      setState(prev => ({
        ...prev,
        layout: newLayout,
        compactType: props.compactType,
        children: props.children,
        propsLayout: props.layout
      }));
    }
  }, [
    props.layout,
    props.children,
    props.compactType,
    props.cols,
    props.allowOverlap,
    state.activeDrag,
    state.children,
    state.propsLayout,
    state.compactType,
    state.layout
  ]);

  // componentDidMount simulation.
  React.useEffect(() => {
    setState(prev => ({ ...prev, mounted: true }));
    onLayoutMaybeChanged(state.layout, props.layout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // componentDidUpdate simulation: call onLayoutMaybeChanged when layout changes and not dragging.
  React.useEffect(() => {
    if (!state.activeDrag) {
      onLayoutMaybeChanged(state.layout, state.oldLayout);
    }
  }, [state.layout, state.activeDrag, state.oldLayout, onLayoutMaybeChanged]);

  // onDragStart: invoked when dragging starts.
  const onDragStart = React.useCallback(
    (i: string, x: number, y: number, { e, node }: GridDragEvent) => {
      const l = getLayoutItem(state.layout, i);
      if (!l) return;
      const placeholder = {
        w: l.w,
        h: l.h,
        x: l.x,
        y: l.y,
        placeholder: true,
        i: i
      };
      setState(prev => ({
        ...prev,
        oldDragItem: cloneLayoutItem(l),
        oldLayout: prev.layout,
        activeDrag: placeholder
      }));
      return props.onDragStart(state.layout, l, l, null, e, node);
    },
    [state.layout, props]
  );

  // onDrag: invoked during dragging.
  const onDrag = React.useCallback(
    (i: string, x: number, y: number, { e, node }: GridDragEvent) => {
      const { oldDragItem } = state;
      let layout = state.layout;
      const { cols, allowOverlap, preventCollision } = props;
      const l = getLayoutItem(layout, i);
      if (!l) return;
      const placeholder = {
        w: l.w,
        h: l.h,
        x: l.x,
        y: l.y,
        placeholder: true,
        i: i
      };
      const isUserAction = true;
      layout = moveElement(
        layout,
        l,
        x,
        y,
        isUserAction,
        preventCollision,
        compactType(props),
        cols,
        allowOverlap
      );
      props.onDrag(layout, oldDragItem, l, placeholder, e, node);
      setState(prev => ({
        ...prev,
        layout: allowOverlap
          ? layout
          : compact(layout, compactType(props), cols),
        activeDrag: placeholder
      }));
    },
    [state, props]
  );

  // onDragStop: invoked when dragging stops.
  const onDragStop = React.useCallback(
    (i: string, x: number, y: number, { e, node }: GridDragEvent) => {
      if (!state.activeDrag) return;
      const { oldDragItem } = state;
      let layout = state.layout;
      const { cols, preventCollision, allowOverlap } = props;
      const l = getLayoutItem(layout, i);
      if (!l) return;
      const isUserAction = true;
      layout = moveElement(
        layout,
        l,
        x,
        y,
        isUserAction,
        preventCollision,
        compactType(props),
        cols,
        allowOverlap
      );
      const newLayout = allowOverlap
        ? layout
        : compact(layout, compactType(props), cols);
      props.onDragStop(newLayout, oldDragItem, l, null, e, node);
      const oldLayout = state.oldLayout;
      setState(prev => ({
        ...prev,
        activeDrag: null,
        layout: newLayout,
        oldDragItem: null,
        oldLayout: null
      }));
      onLayoutMaybeChanged(newLayout, oldLayout);
    },
    [state, props, onLayoutMaybeChanged]
  );

  // onResizeStart: invoked when resizing starts.
  const onResizeStart = React.useCallback(
    (i: string, w: number, h: number, { e, node }: GridResizeEvent) => {
      const l = getLayoutItem(state.layout, i);
      if (!l) return;
      setState(prev => ({
        ...prev,
        oldResizeItem: cloneLayoutItem(l),
        oldLayout: prev.layout,
        resizing: true
      }));
      props.onResizeStart(state.layout, l, l, null, e, node);
    },
    [state.layout, props]
  );

  // onResize: invoked during resize.
  const onResize = React.useCallback(
    (
      i: string,
      w: number,
      h: number,
      { e, node, size, handle }: GridResizeEvent
    ) => {
      const { oldResizeItem } = state;
      let layout = state.layout;
      const { cols, preventCollision, allowOverlap } = props;
      let shouldMoveItem = false;
      let finalLayout;
      let newX;
      let newY;
      const result = withLayoutItem(layout, i, l => {
        let hasCollisions;
        newX = l.x;
        newY = l.y;
        if (["sw", "w", "nw", "n", "ne"].includes(handle)) {
          if (["sw", "nw", "w"].includes(handle)) {
            newX = l.x + (l.w - w);
            w = l.x !== newX && newX < 0 ? l.w : w;
            newX = newX < 0 ? 0 : newX;
          }
          if (["ne", "n", "nw"].includes(handle)) {
            newY = l.y + (l.h - h);
            h = l.y !== newY && newY < 0 ? l.h : h;
            newY = newY < 0 ? 0 : newY;
          }
          shouldMoveItem = true;
        }
        if (props.preventCollision && !allowOverlap) {
          const collisions = getAllCollisions(layout, {
            ...l,
            w,
            h,
            x: newX,
            y: newY
          }).filter(layoutItem => layoutItem.i !== l.i);
          hasCollisions = collisions.length > 0;
          if (hasCollisions) {
            newY = l.y;
            h = l.h;
            newX = l.x;
            w = l.w;
            shouldMoveItem = false;
          }
        }
        l.w = w;
        l.h = h;
        return l;
      });
      const l = result ? result[1] : null;
      if (!l) return;
      finalLayout = result ? result[0] : layout;
      if (shouldMoveItem) {
        const isUserAction = true;
        finalLayout = moveElement(
          finalLayout,
          l,
          newX,
          newY,
          isUserAction,
          props.preventCollision,
          compactType(props),
          cols,
          allowOverlap
        );
      }
      const placeholder = {
        w: l.w,
        h: l.h,
        x: l.x,
        y: l.y,
        static: true,
        i: i
      };
      props.onResize(finalLayout, oldResizeItem, l, placeholder, e, node);
      setState(prev => ({
        ...prev,
        layout: allowOverlap
          ? finalLayout
          : compact(finalLayout, compactType(props), cols),
        activeDrag: placeholder
      }));
    },
    [state, props]
  );

  // onResizeStop: invoked when resizing stops.
  const onResizeStop = React.useCallback(
    (i: string, w: number, h: number, { e, node }: GridResizeEvent) => {
      const { layout, oldResizeItem, oldLayout } = state;
      const { cols, allowOverlap } = props;
      const l = getLayoutItem(layout, i);
      const newLayout = allowOverlap
        ? layout
        : compact(layout, compactType(props), cols);
      props.onResizeStop(newLayout, oldResizeItem, l, null, e, node);
      setState(prev => ({
        ...prev,
        activeDrag: null,
        layout: newLayout,
        oldResizeItem: null,
        oldLayout: null,
        resizing: false
      }));
      onLayoutMaybeChanged(newLayout, oldLayout);
    },
    [state, props, onLayoutMaybeChanged]
  );

  // placeholder: returns the placeholder element when dragging.
  const placeholder = React.useCallback((): ?ReactElement<any> => {
    const activeDrag = state.activeDrag;
    if (!activeDrag) return null;
    const {
      width,
      cols,
      margin,
      containerPadding,
      rowHeight,
      maxRows,
      useCSSTransforms,
      transformScale
    } = props;
    return (
      <GridItem
        w={activeDrag.w}
        h={activeDrag.h}
        x={activeDrag.x}
        y={activeDrag.y}
        i={activeDrag.i}
        className={`react-grid-placeholder ${state.resizing ? "placeholder-resizing" : ""}`}
        containerWidth={width}
        cols={cols}
        margin={margin}
        containerPadding={containerPadding || margin}
        maxRows={maxRows}
        rowHeight={rowHeight}
        isDraggable={false}
        isResizable={false}
        isBounded={false}
        useCSSTransforms={useCSSTransforms}
        transformScale={transformScale}
      >
        <div />
      </GridItem>
    );
  }, [state, props]);

  // processGridItem: enhances a child element with grid functionality.
  const processGridItem = React.useCallback(
    (
      child: ReactElement<any>,
      isDroppingItem?: boolean
    ): ?ReactElement<any> => {
      if (!child || !child.key) return null;
      const l = getLayoutItem(state.layout, String(child.key));
      if (!l) return null;
      const {
        width,
        cols,
        margin,
        containerPadding,
        rowHeight,
        maxRows,
        isDraggable,
        isResizable,
        isBounded,
        useCSSTransforms,
        transformScale,
        draggableCancel,
        draggableHandle,
        resizeHandles,
        resizeHandle
      } = props;
      const { mounted, droppingPosition } = state;
      const draggable =
        typeof l.isDraggable === "boolean"
          ? l.isDraggable
          : !l.static && isDraggable;
      const resizable =
        typeof l.isResizable === "boolean"
          ? l.isResizable
          : !l.static && isResizable;
      const resizeHandlesOptions = l.resizeHandles || resizeHandles;
      const bounded = draggable && isBounded && l.isBounded !== false;
      return (
        <GridItem
          containerWidth={width}
          cols={cols}
          margin={margin}
          containerPadding={containerPadding || margin}
          maxRows={maxRows}
          rowHeight={rowHeight}
          cancel={draggableCancel}
          handle={draggableHandle}
          onDragStop={onDragStop}
          onDragStart={onDragStart}
          onDrag={onDrag}
          onResizeStart={onResizeStart}
          onResize={onResize}
          onResizeStop={onResizeStop}
          isDraggable={draggable}
          isResizable={resizable}
          isBounded={bounded}
          useCSSTransforms={useCSSTransforms && mounted}
          usePercentages={!mounted}
          transformScale={transformScale}
          w={l.w}
          h={l.h}
          x={l.x}
          y={l.y}
          i={l.i}
          minH={l.minH}
          minW={l.minW}
          maxH={l.maxH}
          maxW={l.maxW}
          static={l.static}
          droppingPosition={isDroppingItem ? state.droppingPosition : undefined}
          resizeHandles={resizeHandlesOptions}
          resizeHandle={resizeHandle}
        >
          {child}
        </GridItem>
      );
    },
    [
      state,
      props,
      onDragStop,
      onDragStart,
      onDrag,
      onResizeStart,
      onResize,
      onResizeStop
    ]
  );

  // removeDroppingPlaceholder: removes the dropping placeholder.
  const removeDroppingPlaceholder = React.useCallback(() => {
    const { droppingItem, cols, allowOverlap, margin } = props;
    const newLayout = compact(
      state.layout.filter(l => l.i !== droppingItem.i),
      compactType(props),
      cols,
      allowOverlap
    );
    setState(prev => ({
      ...prev,
      layout: newLayout,
      droppingDOMNode: null,
      activeDrag: null,
      droppingPosition: undefined
    }));
  }, [props, state.layout]);

  // onDragOver: handles native drag over events.
  const onDragOver = React.useCallback(
    (e: DragOverEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (
        isFirefox &&
        !(
          e.nativeEvent.target &&
          e.nativeEvent.target.classList.contains(layoutClassName)
        )
      ) {
        return false;
      }
      const {
        droppingItem,
        onDropDragOver,
        margin,
        cols,
        rowHeight,
        maxRows,
        width,
        containerPadding,
        transformScale
      } = props;
      const onDragOverResult = onDropDragOver ? onDropDragOver(e) : undefined;
      if (onDragOverResult === false) {
        if (state.droppingDOMNode) {
          removeDroppingPlaceholder();
        }
        return false;
      }
      const finalDroppingItem = { ...droppingItem, ...onDragOverResult };
      const gridRect = e.currentTarget.getBoundingClientRect();
      const layerX = e.clientX - gridRect.left;
      const layerY = e.clientY - gridRect.top;
      const droppingPos: DroppingPosition = {
        left: layerX / transformScale,
        top: layerY / transformScale,
        e
      };
      if (!state.droppingDOMNode) {
        const positionParams: PositionParams = {
          cols,
          margin,
          maxRows,
          rowHeight,
          containerWidth: width,
          containerPadding: containerPadding || margin
        };
        const calculatedPosition = calcXY(
          positionParams,
          layerY,
          layerX,
          finalDroppingItem.w,
          finalDroppingItem.h
        );
        setState(prev => ({
          ...prev,
          droppingDOMNode: <div key={finalDroppingItem.i} />,
          droppingPosition: droppingPos,
          layout: [
            ...prev.layout,
            {
              ...finalDroppingItem,
              x: calculatedPosition.x,
              y: calculatedPosition.y,
              static: false,
              isDraggable: true
            }
          ]
        }));
      } else if (state.droppingPosition) {
        const { left, top } = state.droppingPosition;
        const shouldUpdatePosition = left !== layerX || top !== layerY;
        if (shouldUpdatePosition) {
          setState(prev => ({
            ...prev,
            droppingPosition: droppingPos
          }));
        }
      }
    },
    [props, state, removeDroppingPlaceholder]
  );

  // onDragLeave: reduces dragEnter count and removes placeholder if needed.
  const onDragLeave = React.useCallback(
    (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      dragEnterCounter.current--;
      if (dragEnterCounter.current === 0) {
        removeDroppingPlaceholder();
      }
    },
    [removeDroppingPlaceholder]
  );

  // onDragEnter: increases dragEnter count.
  const onDragEnter = React.useCallback((e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    dragEnterCounter.current++;
  }, []);

  // onDrop: handles drop events.
  const onDrop = React.useCallback(
    (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      const { droppingItem, onDrop } = props;
      const item = state.layout.find(l => l.i === droppingItem.i);
      dragEnterCounter.current = 0;
      removeDroppingPlaceholder();
      props.onDrop(state.layout, item, e);
    },
    [props, state.layout, removeDroppingPlaceholder]
  );

  const mergedClassName = clsx(layoutClassName, props.className);
  const mergedStyle = {
    height: containerHeight(),
    ...props.style
  };

  return (
    <div
      ref={props.innerRef}
      className={mergedClassName}
      style={mergedStyle}
      onDrop={props.isDroppable ? onDrop : noop}
      onDragLeave={props.isDroppable ? onDragLeave : noop}
      onDragEnter={props.isDroppable ? onDragEnter : noop}
      onDragOver={props.isDroppable ? onDragOver : noop}
    >
      {React.Children.map(props.children, child => processGridItem(child))}
      {props.isDroppable &&
        state.droppingDOMNode &&
        processGridItem(state.droppingDOMNode, true)}
      {placeholder()}
    </div>
  );
}

ReactGridLayout.displayName = "ReactGridLayout";
ReactGridLayout.propTypes = ReactGridLayoutPropTypes;
ReactGridLayout.defaultProps = {
  autoSize: true,
  cols: 12,
  className: "",
  style: {},
  draggableHandle: "",
  draggableCancel: "",
  containerPadding: null,
  rowHeight: 150,
  maxRows: Infinity, // infinite vertical growth
  layout: [],
  margin: [10, 10],
  isBounded: false,
  isDraggable: true,
  isResizable: true,
  allowOverlap: false,
  isDroppable: false,
  useCSSTransforms: true,
  transformScale: 1,
  verticalCompact: true,
  compactType: "vertical",
  preventCollision: false,
  droppingItem: {
    i: "__dropping-elem__",
    h: 1,
    w: 1
  },
  resizeHandles: ["se"],
  onLayoutChange: noop,
  onDragStart: noop,
  onDrag: noop,
  onDragStop: noop,
  onResizeStart: noop,
  onResize: noop,
  onResizeStop: noop,
  onDrop: noop,
  onDropDragOver: noop
};

export default ReactGridLayout;
