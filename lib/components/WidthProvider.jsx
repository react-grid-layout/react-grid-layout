// @flow
import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import type { ComponentType as ReactComponentType } from "react";

type WPProps = {
  className?: string,
  measureBeforeMount: boolean,
  style?: Object
};

/*
 * A simple HOC that provides facility for listening to container resizes.
 */
function WidthProvider<Props, ComposedProps: { ...Props, ...WPProps }>(
  ComposedComponent: ReactComponentType<Props>
): ReactComponentType<ComposedProps> {
  const WidthProvider = ({
    className,
    measureBeforeMount,
    style,
    ...rest
  }: ComposedProps) => {
    const currentRef = useRef(null);
    const [width, setWidth]: [number, Function] = useState(() => 1280);
    const [mounted, setMounted]: [boolean, Function] = useState(() => false);

    const onWindowResize = () => {
      if (!mounted) return;
      if (!currentRef.current || !currentRef.current.clientWidth) return;
      setWidth(currentRef.current.clientWidth);
    };

    useEffect(() => {
      setMounted(true);

      window.addEventListener("resize", onWindowResize);
      // Call to properly set the breakpoint and resize the elements.
      // Note that if you're doing a full-width element, this can get a little wonky if a scrollbar
      // appears because of the grid. In that case, fire your own resize event, or set `overflow: scroll` on your body.
      onWindowResize();
      return () => {
        setMounted(false);
        window.removeEventListener("resize", onWindowResize);
      };
    }, []);

    if (measureBeforeMount && !mounted) {
      return <div className={className} style={style} />;
    }

    return (
      <div ref={currentRef}>
        <ComposedComponent {...rest} width={width} />
      </div>
    );
  };

  WidthProvider.defaultProps = {
    measureBeforeMount: false
  };

  WidthProvider.propTypes = {
    // If true, will not render children until mounted. Useful for getting the exact width before
    // rendering, to prevent any unsightly resizing.
    measureBeforeMount: PropTypes.bool
  };

  return WidthProvider;
}

export default WidthProvider;
