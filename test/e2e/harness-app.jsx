import * as React from "react";
import { createRoot } from "react-dom/client";
import GridLayout, {
  useContainerWidth,
  verticalCompactor
} from "react-grid-layout";
import "../../css/styles.css";

const layout = [
  { i: "a", x: 0, y: 0, w: 3, h: 3 },
  { i: "b", x: 3, y: 0, w: 3, h: 3 },
  { i: "c", x: 6, y: 0, w: 3, h: 3 },
  { i: "d", x: 0, y: 3, w: 3, h: 3 }
];

// A tall layout that overflows the scroll container.
const scrollLayout = Array.from({ length: 12 }, (_, i) => ({
  i: String.fromCodePoint(97 + i),
  x: (i * 2) % 12,
  y: i * 2,
  w: 2,
  h: 2
}));

function App() {
  const { width, containerRef } = useContainerWidth();
  return (
    <div id="grid-container" ref={containerRef} style={{ width: 1000 }}>
      <GridLayout
        width={width}
        layout={layout}
        gridConfig={{ cols: 12, rowHeight: 30, margin: [10, 10] }}
        compactor={verticalCompactor}
      >
        {layout.map(item => (
          <div key={item.i} className="grid-item">
            {item.i}
          </div>
        ))}
      </GridLayout>
      <hr />
      <h3>Scroll container (edge-scroll #2232)</h3>
      <div
        id="scroll-container"
        style={{
          width: 600,
          height: 200,
          overflow: "auto",
          border: "1px solid #ccc"
        }}
      >
        <GridLayout
          width={600}
          layout={scrollLayout}
          gridConfig={{ cols: 12, rowHeight: 30, margin: [10, 10] }}
          compactor={verticalCompactor}
        >
          {scrollLayout.map(item => (
            <div key={item.i} className="grid-item">
              {item.i}
            </div>
          ))}
        </GridLayout>
      </div>
    </div>
  );
}

createRoot(document.getElementById("grid")).render(<App />);
