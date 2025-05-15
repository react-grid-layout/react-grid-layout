import * as React from "react";

declare module "@incmix/react-grid-layout" {
  export type ResizeHandleAxis =
    | "s"
    | "w"
    | "e"
    | "n"
    | "sw"
    | "nw"
    | "se"
    | "ne";

  export type LayoutItem = {
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
    isDraggable?: boolean | null;
    isResizable?: boolean | null;
    resizeHandles?: Array<ResizeHandleAxis>;
    isBounded?: boolean | null;
    placeholder?: boolean;
  };

  export type Layout = ReadonlyArray<LayoutItem>;

  export type Position = {
    left: number;
    top: number;
    width: number;
    height: number;
  };

  export type ReactDraggableCallbackData = {
    node: HTMLElement;
    x?: number;
    y?: number;
    deltaX: number;
    deltaY: number;
    lastX?: number;
    lastY?: number;
  };

  export type PartialPosition = { left: number; top: number };
  export type DroppingPosition = { left: number; top: number; e: Event };
  export type Size = { width: number; height: number };

  export type GridDragEvent = {
    e: Event;
    node: HTMLElement;
    newPosition: PartialPosition;
  };

  export type GridResizeEvent = {
    e: Event;
    node: HTMLElement;
    size: Size;
    handle: string;
  };

  export type DragOverEvent = MouseEvent & {
    nativeEvent: {
      layerX: number;
      layerY: number;
    } & Event;
  };

  export type EventCallback = (
    layout: Layout,
    oldItem: LayoutItem | null,
    newItem: LayoutItem | null,
    placeholder: LayoutItem | null,
    event: Event,
    element?: HTMLElement
  ) => void;

  export type CompactType = "horizontal" | "vertical" | null;

  export type ResizeHandle =
    | React.ReactElement
    | ((
        resizeHandleAxis: ResizeHandleAxis,
        ref: React.RefObject<HTMLElement>
      ) => React.ReactElement);

  export type NestedLayoutItem = LayoutItem & {
    layouts?: { [key: string]: Layout };
  };

  export type NestedLayout = { [key: string]: NestedLayoutItem };

  export type DefaultBreakpoints = "lg" | "md" | "sm" | "xs" | "xxs";

  export interface CoreProps {
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
    containerPadding?: [number, number] | null;
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
    onLayoutChange?: (layout: Layout) => void;
    onDrag?: EventCallback;
    onDragStart?: EventCallback;
    onDragStop?: EventCallback;
    onResize?: EventCallback;
    onResizeStart?: EventCallback;
    onResizeStop?: EventCallback;
    onDropDragOver?: (
      e: DragOverEvent
    ) => { w?: number; h?: number } | false | null;
    onDrop?: (layout: Layout, item: LayoutItem | null, e: Event) => void;
    children?: React.ReactNode;
    innerRef?: React.Ref<HTMLDivElement>;
  }

  export interface ReactGridLayoutProps extends CoreProps {
    // Additional props specific to ReactGridLayout
  }

  export type Breakpoint = string;
  export type Breakpoints = {
    [breakpoint: string]: number;
  };

  export type ResponsiveLayout<T extends string = string> = {
    [P in T]?: Layout;
  };

  export interface ResponsiveProps<T extends string = string>
    extends Omit<
      CoreProps,
      "cols" | "margin" | "containerPadding" | "onLayoutChange"
    > {
    breakpoint?: T | null;
    breakpoints: Breakpoints;
    cols: {
      [key in T]: number;
    };
    layouts: ResponsiveLayout<T>;
    width: number;
    margin: { [key in T]: [number, number] } | [number, number];
    containerPadding:
      | { [key in T]: [number, number] | null }
      | [number, number]
      | null;
    onBreakpointChange?: (breakpoint: T, cols: number) => void;
    onLayoutChange?: (layout: Layout, layouts: ResponsiveLayout<T>) => void;
    onWidthChange?: (
      containerWidth: number,
      margin: [number, number],
      cols: number,
      containerPadding: [number, number] | null
    ) => void;
  }

  export interface NestedGridLayoutProps extends CoreProps {
    layouts: NestedLayout;
    children: React.ReactNode;
  }

  export interface WidthProviderProps {
    className?: string;
    measureBeforeMount?: boolean;
    style?: React.CSSProperties;
  }

  // Utils
  export namespace utils {
    export function bottom(layout: Layout): number;
    export function cloneLayout(layout: Layout): Layout;
    export function cloneLayoutItem(layoutItem: LayoutItem): LayoutItem;
    export function childrenEqual(
      a: React.ReactNode,
      b: React.ReactNode
    ): boolean;
    export function collides(l1: LayoutItem, l2: LayoutItem): boolean;
    export function compact(
      layout: Layout,
      compactType: CompactType,
      cols: number
    ): Layout;
    export function getAllCollisions(
      layout: Layout,
      layoutItem: LayoutItem
    ): Array<LayoutItem>;
    export function getLayoutItem(
      layout: Layout,
      id: string
    ): LayoutItem | null;
    export function moveElement(
      layout: Layout,
      l: LayoutItem,
      x: number | null,
      y: number | null,
      isUserAction: boolean,
      preventCollision: boolean,
      compactType: CompactType,
      cols: number
    ): Layout;
    export function synchronizeLayoutWithChildren(
      initialLayout: Layout,
      children: React.ReactNode,
      cols: number,
      compactType: CompactType,
      allowOverlap?: boolean
    ): Layout;
    export function validateLayout(layout: Layout, contextName?: string): void;
  }

  export namespace calculateUtils {
    export function calcXY(
      positionParams: {
        margin: [number, number];
        containerPadding: [number, number] | null;
        containerWidth: number;
        cols: number;
        rowHeight: number;
        maxRows: number;
      },
      x: number,
      y: number,
      w: number,
      h: number
    ): { x: number; y: number };
  }

  export namespace responsiveUtils {
    export function getBreakpointFromWidth(
      breakpoints: Breakpoints,
      width: number
    ): string;
    export function getColsFromBreakpoint(
      breakpoint: string,
      cols: { [key: string]: number }
    ): number;
    export function findOrGenerateResponsiveLayout(
      layouts: ResponsiveLayout,
      breakpoints: Breakpoints,
      breakpoint: string,
      lastBreakpoint: string,
      cols: number,
      compactType: CompactType
    ): Layout;
    export function sortBreakpoints(breakpoints: Breakpoints): Array<string>;
  }

  // Components
  export default class ReactGridLayout extends React.Component<ReactGridLayoutProps> {}

  export class Responsive extends React.Component<ResponsiveProps> {
    static utils: typeof responsiveUtils;
  }

  export class NestedGridLayout extends React.Component<NestedGridLayoutProps> {}

  export function WidthProvider<P>(
    ComposedComponent: React.ComponentType<P>
  ): React.ComponentType<P & WidthProviderProps>;
}
