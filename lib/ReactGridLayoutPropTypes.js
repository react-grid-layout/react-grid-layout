// @flow
import PropTypes from "prop-types";
import React from "react";
import type {
  Ref,
  ChildrenArray as ReactChildrenArray,
  Element as ReactElement
} from "react";
import type {
  DragOverEvent,
  EventCallback,
  CompactType,
  Layout,
  LayoutItem
} from "./utils";

// util
export type ReactRef<T: HTMLElement> = {|
  +current: T | null
|};

export type ResizeHandleAxis =
  | "s"
  | "w"
  | "e"
  | "n"
  | "sw"
  | "nw"
  | "se"
  | "ne";
export type ResizeHandle =
  | ReactElement<any>
  | ((
      resizeHandleAxis: ResizeHandleAxis,
      ref: ReactRef<HTMLElement>
    ) => ReactElement<any>);

// Defines which resize handles should be rendered (default: 'se')
// Allows for any combination of:
// 's' - South handle (bottom-center)
// 'w' - West handle (left-center)
// 'e' - East handle (right-center)
// 'n' - North handle (top-center)
// 'sw' - Southwest handle (bottom-left)
// 'nw' - Northwest handle (top-left)
// 'se' - Southeast handle (bottom-right)
// 'ne' - Northeast handle (top-right)
export const resizeHandleAxesType: ReactPropsChainableTypeChecker =
  PropTypes.arrayOf(
    PropTypes.oneOf(["s", "w", "e", "n", "sw", "nw", "se", "ne"])
  );
// Custom component for resize handles
export const resizeHandleType: ReactPropsChainableTypeChecker =
  PropTypes.oneOfType([PropTypes.node, PropTypes.func]);

export type Props = {|
  className: string,
  style: Object,
  width: number,
  autoSize: boolean,
  cols: number,
  draggableCancel: string,
  draggableHandle: string,
  verticalCompact: boolean,
  compactType: CompactType,
  layout: Layout,
  margin: [number, number],
  containerPadding: ?[number, number],
  rowHeight: number,
  maxRows: number,
  isBounded: boolean,
  isDraggable: boolean,
  isResizable: boolean,
  isDroppable: boolean,
  preventCollision: boolean,
  useCSSTransforms: boolean,
  transformScale: number,
  droppingItem: $Shape<LayoutItem>,
  resizeHandles: ResizeHandleAxis[],
  resizeHandle?: ResizeHandle,
  allowOverlap: boolean,

  // Callbacks
  onLayoutChange: Layout => void,
  onDrag: EventCallback,
  onDragStart: EventCallback,
  onDragStop: EventCallback,
  onResize: EventCallback,
  onResizeStart: EventCallback,
  onResizeStop: EventCallback,
  onDropDragOver: (e: DragOverEvent) => ?({| w?: number, h?: number |} | false),
  onDrop: (layout: Layout, item: ?LayoutItem, e: Event) => void,
  children: ReactChildrenArray<ReactElement<any>>,
  innerRef?: Ref<"div">
|};

export type DefaultProps = $Diff<
  Props,
  {
    children: ReactChildrenArray<ReactElement<any>>,
    width: number
  }
>;

export default {
  //
  // Basic props
  //
  className: PropTypes.string,
  style: PropTypes.object,

  // This can be set explicitly. If it is not set, it will automatically
  // be set to the container width. Note that resizes will *not* cause this to adjust.
  // If you need that behavior, use WidthProvider.
  width: PropTypes.number,

  // If true, the container height swells and contracts to fit contents
  autoSize: PropTypes.bool,
  // # of cols.
  cols: PropTypes.number,

  // A selector that will not be draggable.
  draggableCancel: PropTypes.string,
  // A selector for the draggable handler
  draggableHandle: PropTypes.string,

  // Deprecated
  verticalCompact: function (props: Props) {
    if (
      props.verticalCompact === false &&
      process.env.NODE_ENV !== "production"
    ) {
      console.warn(
        // eslint-disable-line no-console
        "`verticalCompact` on <ReactGridLayout> is deprecated and will be removed soon. " +
          'Use `compactType`: "horizontal" | "vertical" | null.'
      );
    }
  },
  // Choose vertical or hotizontal compaction
  compactType: (PropTypes.oneOf([
    "vertical",
    "horizontal"
  ]): ReactPropsChainableTypeChecker),

  // layout is an array of object with the format:
  // {x: Number, y: Number, w: Number, h: Number, i: String}
  layout: function (props: Props) {
    var layout = props.layout;
    // I hope you're setting the data-grid property on the grid items
    if (layout === undefined) return;
    require("./utils").validateLayout(layout, "layout");
  },

  //
  // Grid Dimensions
  //

  // Margin between items [x, y] in px
  margin: (PropTypes.arrayOf(PropTypes.number): ReactPropsChainableTypeChecker),
  // Padding inside the container [x, y] in px
  containerPadding: (PropTypes.arrayOf(
    PropTypes.number
  ): ReactPropsChainableTypeChecker),
  // Rows have a static height, but you can change this based on breakpoints if you like
  rowHeight: PropTypes.number,
  // Default Infinity, but you can specify a max here if you like.
  // Note that this isn't fully fleshed out and won't error if you specify a layout that
  // extends beyond the row capacity. It will, however, not allow users to drag/resize
  // an item past the barrier. They can push items beyond the barrier, though.
  // Intentionally not documented for this reason.
  maxRows: PropTypes.number,

  //
  // Flags
  //
  isBounded: PropTypes.bool,
  isDraggable: PropTypes.bool,
  isResizable: PropTypes.bool,
  // If true, grid can be placed one over the other.
  allowOverlap: PropTypes.bool,
  // If true, grid items won't change position when being dragged over.
  preventCollision: PropTypes.bool,
  // Use CSS transforms instead of top/left
  useCSSTransforms: PropTypes.bool,
  // parent layout transform scale
  transformScale: PropTypes.number,
  // If true, an external element can trigger onDrop callback with a specific grid position as a parameter
  isDroppable: PropTypes.bool,

  // Resize handle options
  resizeHandles: resizeHandleAxesType,
  resizeHandle: resizeHandleType,

  //
  // Callbacks
  //

  // Callback so you can save the layout. Calls after each drag & resize stops.
  onLayoutChange: PropTypes.func,

  // Calls when drag starts. Callback is of the signature (layout, oldItem, newItem, placeholder, e, ?node).
  // All callbacks below have the same signature. 'start' and 'stop' callbacks omit the 'placeholder'.
  onDragStart: PropTypes.func,
  // Calls on each drag movement.
  onDrag: PropTypes.func,
  // Calls when drag is complete.
  onDragStop: PropTypes.func,
  //Calls when resize starts.
  onResizeStart: PropTypes.func,
  // Calls when resize movement happens.
  onResize: PropTypes.func,
  // Calls when resize is complete.
  onResizeStop: PropTypes.func,
  // Calls when some element is dropped.
  onDrop: PropTypes.func,

  //
  // Other validations
  //

  droppingItem: (PropTypes.shape({
    i: PropTypes.string.isRequired,
    w: PropTypes.number.isRequired,
    h: PropTypes.number.isRequired
  }): ReactPropsChainableTypeChecker),

  // Children must not have duplicate keys.
  children: function (props: Props, propName: string) {
    const children = props[propName];

    // Check children keys for duplicates. Throw if found.
    const keys = {};
    React.Children.forEach(children, function (child) {
      if (child?.key == null) return;
      if (keys[child.key]) {
        throw new Error(
          'Duplicate child key "' +
            child.key +
            '" found! This will cause problems in ReactGridLayout.'
        );
      }
      keys[child.key] = true;
    });
  },

  // Optional ref for getting a reference for the wrapping div.
  innerRef: PropTypes.any
};
