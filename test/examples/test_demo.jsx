import React from 'react';
import RGL, { WidthProvider } from 'react-grid-layout';

const ReactGridLayout = WidthProvider(RGL);


export const IsBounded = ({ onDragStop }) => {

  const layout = [
    { i: '0', x: 0, y: 0, w: 1, h: 1 },
    { i: '1', x: 1, y: 0, w: 1, h: 1 },
  ]

  return (
    <ReactGridLayout
      layout={layout}
      isBounded={true}
      onDragStop={onDragStop}
    >
      {
        layout.map(ele => <div key={ele.i}>{ele.i}</div>)
      }
    </ReactGridLayout>
  );
};
