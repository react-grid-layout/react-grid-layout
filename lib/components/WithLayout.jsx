import React, {
    ReactNode,
    MouseEvent,
    TouchEvent,
    CSSProperties,
    ComponentType,
  } from "react";
  import { Layout } from "react-grid-layout";
  
  type WithLayoutProps = {
    key?: string;
    "data-grid"?: Layout;
    className?: any;
    style?: CSSProperties;
    children?: ReactNode[];
    onMouseDown?: (e: MouseEvent) => {};
    onMouseUp?: (e: MouseEvent) => {};
    onTouchEnd?: (e: TouchEvent) => {};
  };
  export function WithLayout<T>(
    Component: ComponentType<T>
  ): ComponentType<T & WithLayoutProps> {
    return (props: T & WithLayoutProps) => {
      // for this to work, the full type of WithLayoutProps has to be destructed,
      // so that the component props all end up in the rested value
      const {
        "data-grid": Layout,
        key,
        className,
        style,
        children,
        onMouseDown,
        onMouseUp,
        onTouchEnd,
        ...componentProps
      }: WithLayoutProps & T = props;
      const compProps = (componentProps as unknown) as T;
      return (
        <div
          key={key}
          data-grid={props["data-grid"]}
          className={className}
          style={style}
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
          onTouchEnd={onTouchEnd}
        >
          <Component {...compProps} />
          {children}
        </div>
      );
    };
  }