/* @flow */
import * as React from "react";
import PropTypes from "prop-types";
import ReactGridLayout from "./ReactGridLayout";
import type { Layout, LayoutItem } from "./utils";

type NestedLayoutItem = LayoutItem & {
  layouts?: { [key: string]: Layout }
};

type NestedLayout = { [key: string]: NestedLayoutItem };

type Props = {
  ...React.ElementConfig<typeof ReactGridLayout>,
  layouts: NestedLayout,
  children: React.ChildrenArray<React.ElementType>
};

function NestedGridLayout(props: Props): React.Node {
  const { layouts, children, ...rest } = props;

  // Process children to handle nested layouts
  const processedChildren = React.Children.map(children, child => {
    if (!React.isValidElement(child)) return child;

    const childKey = child.key;
    if (!childKey) return child;

    // Find the layout item for this child
    const layoutItem = layouts[childKey];
    if (!layoutItem) return child;

    // If this layout item has nested layouts, create a container with the nested grid
    if (layoutItem.layouts) {
      const { layouts: nestedLayouts, ...parentLayout } = layoutItem;
      return (
        <div
          key={childKey}
          data-grid={parentLayout}
          style={{ pointerEvents: "none" }}
        >
          <div style={{ pointerEvents: "auto" }}>
            <NestedGridLayout
              {...rest}
              layouts={nestedLayouts}
              className="nested-grid"
            >
              {child.props.children}
            </NestedGridLayout>
          </div>
        </div>
      );
    }

    // Otherwise, just wrap the child in a div with the layout data
    return (
      <div key={childKey} data-grid={layoutItem}>
        {child}
      </div>
    );
  });

  return <ReactGridLayout {...rest}>{processedChildren}</ReactGridLayout>;
}

NestedGridLayout.propTypes = {
  ...ReactGridLayout.propTypes,
  layouts: PropTypes.objectOf(
    PropTypes.shape({
      i: PropTypes.string.isRequired,
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
      w: PropTypes.number.isRequired,
      h: PropTypes.number.isRequired,
      layouts: PropTypes.object
    })
  ).isRequired
};

export default NestedGridLayout;
