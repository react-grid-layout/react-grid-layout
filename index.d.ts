import { ReactNode, Ref } from "react";

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

export type Breakpoint = "lg" | "md" | "sm";

export type EventCallback = (
  layout: Layout,
  oldItem: LayoutItem | null,
  newItem: LayoutItem | null,
  placeholder: LayoutItem | null,
  e: Event,
  node?: HTMLElement
) => void;

export type ResizeHandle =
  | ReactNode
  | ((resizeHandleAxis: ResizeHandleAxis, ref: Ref<HTMLElement>) => ReactNode);

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
  onDropDragOver?: (e: DragOverEvent) => { w?: number; h?: number } | false;
  onDrop?: (layout: Layout, item: LayoutItem | null, e: Event) => void;
  children?: ReactNode;
  innerRef?: Ref<HTMLDivElement>;
}

export interface ResponsiveReactGridLayoutProps extends ReactGridLayoutProps {
  breakpoints?: { [key in Breakpoint]: number };
  cols?: { [key in Breakpoint]: number };
  layouts?: { [key in Breakpoint]: Layout };
  onBreakpointChange?: (newBreakpoint: Breakpoint, newCols: number) => void;
  onLayoutChange?: (
    currentLayout: Layout,
    allLayouts: { [key in Breakpoint]: Layout }
  ) => void;
  onWidthChange?: (
    containerWidth: number,
    margin: [number, number],
    cols: number,
    containerPadding: [number, number]
  ) => void;
}

export interface WidthProviderProps {
  measureBeforeMount?: boolean;
}

export class ReactGridLayout extends React.Component<ReactGridLayoutProps> {}
export class ResponsiveReactGridLayout extends React.Component<ResponsiveReactGridLayoutProps> {}
export class WidthProvider extends React.Component<WidthProviderProps> {}

export function WidthProvider<P extends object>(
  WrappedComponent: React.ComponentType<P>
): React.ComponentType<P & WidthProviderProps>;

export default ReactGridLayout;
