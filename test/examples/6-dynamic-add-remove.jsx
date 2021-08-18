import React, { useState } from 'react';
import { WidthProvider, Responsive } from 'react-grid-layout';
import '/node_modules/react-grid-layout/css/styles.css';
import '/node_modules/react-resizable/css/styles.css';

const ResponsiveReactGridLayout = WidthProvider(Responsive);

const defaultProps = {
  className: 'layout',
  cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
  rowHeight: 20
};

/**
 * This layout demonstrates how to use a grid with a dynamic number of elements.
 */
export function App(props = defaultProps) {
  const [data, setData] = useState({
    items: [0, 1, 2, 3, 4].map((i, key, list) => ({
      i: i.toString(),
      x: i,
      y: 0,
      w: 1,
      h: 1,
      add: i === list.length - 1
    })),
    newCounter: 0
  });
  console.log(data);

  function createElement(el) {
    const removeStyle = {
      position: 'absolute',
      right: '2px',
      top: 0,
      cursor: 'pointer'
    };
    const i = el.add ? '+' : el.i;
    return (
      <div key={i} data-grid={el}>
        {el.add ? (
          <span
            className="add text"
            onClick={onAddItem}
            title="You can add an item by clicking here, too."
          >
            Add +
          </span>
        ) : (
          <span className="text">{i}</span>
        )}
        <span className="remove" style={removeStyle} onClick={onRemoveItem}>
          x
        </span>
      </div>
    );
  }

  function onAddItem() {
    console.log('adding', 'n' + data.newCounter);
    setData({
      // Add a new item. It must have a unique key!
      items: data.items.concat({
        i: 'n' + data.newCounter,
        x: (data.items.length * 2) % (data.cols || 12),
        y: Infinity, // puts it at the bottom
        w: 1,
        h: 1
      }),
       // Increment the counter to ensure key is always unique.
      newCounter: data.newCounter + 1
    });
  }

    // We're using the cols coming back from this to calculate where to add new items.
  function onBreakpointChange(breakpoint, cols) {
    setData({ ...data, breakpoint: breakpoint, cols: cols });
  }

  function onLayoutChange(layout) {
    typeof props.onLayoutChange === 'function' && props.onLayoutChange(layout);
    setData({ ...data, layout: layout });
  }

  function onRemoveItem(i) {
    console.log('removing', i);
    setData({ items: data.items.filter({ i: i }) });
  }

  return (
    <div>
      <button onClick={onAddItem}>Add Item</button>
      <ResponsiveReactGridLayout
        onLayoutChange={onLayoutChange}
        onBreakpointChange={onBreakpointChange}
        {...props}
      >
        {data.items.map((el) => createElement(el))}
      </ResponsiveReactGridLayout>
    </div>
  );
}

if (process.env.STATIC_EXAMPLES === true) {
  import("../test-hook.jsx").then(fn => fn.default(AddRemoveLayout));
}
