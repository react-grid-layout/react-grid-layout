// @flow
import * as React from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import type { ReactRef } from "../ReactGridLayoutPropTypes";

type WPDefaultProps = {|
  measureBeforeMount: boolean
|};

type WPProps = {|
  className?: string,
  style?: Object,
  ...WPDefaultProps
|};

type ComposedProps<Config> = {|
  ...Config,
  measureBeforeMount?: boolean,
  className?: string,
  style?: Object,
  width?: number
|};

const layoutClassName = "react-grid-layout";

// Functional HOC that provides width measurement using ResizeObserver and hooks.
export default function WidthProvideRGL<Config>(
  ComposedComponent: React.ComponentType<Config>
): React.ComponentType<ComposedProps<Config>> {
  function WidthProvider(props: ComposedProps<Config>) {
    const { measureBeforeMount, className, style, ...rest } = props;

    // Use state to hold measured width, initially 1280 as default.
    const [width, setWidth] = React.useState(1280);
    // Track mounted state to conditionally render children.
    const [mounted, setMounted] = React.useState(false);
    // Reference to the DOM node.
    const elementRef: React.RefObject<?HTMLDivElement> = React.useRef(null);

    React.useEffect(() => {
      setMounted(true);
      // Create a ResizeObserver instance to measure width changes.
      const resizeObserver = new ResizeObserver(entries => {
        if (entries.length === 0) return;
        const entry = entries[0];
        if (entry && entry.contentRect) {
          setWidth(entry.contentRect.width);
        }
      });
      const node = elementRef.current;
      if (node instanceof HTMLElement) {
        resizeObserver.observe(node);
      }
      // Cleanup function: unobserve and disconnect the observer.
      return () => {
        if (node instanceof HTMLElement) {
          resizeObserver.unobserve(node);
        }
        resizeObserver.disconnect();
      };
    }, []);

    // If measureBeforeMount is true and component is not mounted yet,
    // render a placeholder div with the same className and style.
    if (measureBeforeMount && !mounted) {
      return (
        <div
          className={clsx(className, layoutClassName)}
          style={style}
          ref={elementRef}
        />
      );
    }

    // Render the composed component passing the measured width and innerRef.
    return <ComposedComponent innerRef={elementRef} {...rest} width={width} />;
  }

  // Set default props for the HOC.
  WidthProvider.defaultProps = {
    measureBeforeMount: false
  };

  // PropTypes validation.
  WidthProvider.propTypes = {
    measureBeforeMount: PropTypes.bool,
    className: PropTypes.string,
    style: PropTypes.object
  };

  return WidthProvider;
}
