/**
 * Type declarations for react-resizable
 */

declare module "react-resizable" {
  import * as React from "react";

  export interface ResizeCallbackData {
    node: HTMLElement;
    size: { width: number; height: number };
    handle: string;
  }

  export type ResizeCallback = (
    e: React.SyntheticEvent,
    data: ResizeCallbackData
  ) => void;

  export interface ResizableProps {
    children: React.ReactElement;
    width: number;
    height: number;
    className?: string;
    draggableOpts?: { disabled?: boolean };
    minConstraints?: [number, number];
    maxConstraints?: [number, number];
    onResizeStart?: ResizeCallback;
    onResize?: ResizeCallback;
    onResizeStop?: ResizeCallback;
    transformScale?: number;
    resizeHandles?: string[];
    handle?:
      | React.ReactElement
      | ((axis: string, ref: React.Ref<HTMLElement>) => React.ReactElement);
    axis?: "x" | "y" | "both";
    lockAspectRatio?: boolean;
  }

  export class Resizable extends React.Component<ResizableProps> {}

  export interface ResizableBoxProps extends ResizableProps {
    style?: React.CSSProperties;
  }

  export class ResizableBox extends React.Component<ResizableBoxProps> {}
}
