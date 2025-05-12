import * as React from "react";

export type ResizeHandleAxis =
  | "s"
  | "w"
  | "e"
  | "n"
  | "sw"
  | "nw"
  | "se"
  | "ne";

export interface LayoutItem {
  w: number;
  h: number;
  x: number;
  y: number;
  i: string;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
  moved?: boolean;
  static?: boolean;
  isDraggable?: boolean;
  isResizable?: boolean;
  resizeHandles?: ResizeHandleAxis[];
  isBounded?: boolean;
}

export type Layout = ReadonlyArray<LayoutItem>;

export interface Position {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface ReactDraggableCallbackData {
  node: HTMLElement;
  x?: number;
  y?: number;
  deltaX: number;
  deltaY: number;
  lastX?: number;
  lastY?: number;
}

export interface PartialPosition {
  left: number;
  top: number;
}

export interface DroppingPosition {
  left: number;
  top: number;
  e: Event;
}

export interface Size {
  width: number;
  height: number;
}

export interface GridDragEvent {
  e: Event;
  node: HTMLElement;
  newPosition: PartialPosition;
}

export interface GridResizeEvent {
  e: Event;
  node: HTMLElement;
  size: Size;
  handle: string;
}

export interface DragOverEvent extends MouseEvent {
  nativeEvent: {
    layerX: number;
    layerY: number;
  } & Event;
}

export type CompactType = "horizontal" | "vertical" | null;

export type EventCallback = (
  layout: Layout,
  oldItem: LayoutItem | null,
  newItem: LayoutItem | null,
  placeholder: LayoutItem | null,
  e: Event,
  node?: HTMLElement
) => void;

export type ResizeHandle =
  | React.ReactElement
  | ((
      resizeHandleAxis: ResizeHandleAxis,
      ref: React.RefObject<HTMLElement>
    ) => React.ReactElement);

export interface ReactGridLayoutProps {
  className?: string;
  style?: React.CSSProperties;
  width?: number;
  autoSize?: boolean;
  cols?: number;
  draggableCancel?: string;
  draggableHandle?: string;
  verticalCompact?: boolean;
  compactType?: CompactType;
  layout?: Layout;
  margin?: [number, number];
  containerPadding?: [number, number];
  rowHeight?: number;
  maxRows?: number;
  isBounded?: boolean;
  isDraggable?: boolean;
  isResizable?: boolean;
  isDroppable?: boolean;
  preventCollision?: boolean;
  useCSSTransforms?: boolean;
  transformScale?: number;
  droppingItem?: Partial<LayoutItem>;
  resizeHandles?: ResizeHandleAxis[];
  resizeHandle?: ResizeHandle;
  allowOverlap?: boolean;

  // Callbacks
  onLayoutChange?: (layout: Layout) => void;
  onDrag?: EventCallback;
  onDragStart?: EventCallback;
  onDragStop?: EventCallback;
  onResize?: EventCallback;
  onResizeStart?: EventCallback;
  onResizeStop?: EventCallback;
  onDropDragOver?: (
    e: DragOverEvent
  ) => ({ w?: number; h?: number } | false) | null;
  onDrop?: (layout: Layout, item: LayoutItem | null, e: Event) => void;
  children?: React.ReactNode;
  innerRef?: React.RefObject<HTMLDivElement>;
}

export interface ReactGridLayoutState {
  activeDrag: LayoutItem | null;
  layout: Layout;
  mounted: boolean;
  oldDragItem: LayoutItem | null;
  oldLayout: Layout | null;
  oldResizeItem: LayoutItem | null;
  resizing: boolean;
  droppingDOMNode: HTMLElement | null;
  droppingPosition: DroppingPosition | undefined;
  children: React.ReactNode;
  compactType: CompactType;
  propsLayout: Layout | undefined;
}

declare class ReactGridLayout extends React.Component<
  ReactGridLayoutProps,
  ReactGridLayoutState
> {
  static propTypes: any;
  static defaultProps: Partial<ReactGridLayoutProps>;
}

export default ReactGridLayout;
