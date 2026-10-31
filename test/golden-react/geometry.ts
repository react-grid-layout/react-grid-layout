export interface GeometryOptions {
  width?: number;
  height?: number;
  gridOffset?: { left: number; top: number };
  scale?: number;
  scroll?: { left: number; top: number };
  left?: number;
  top?: number;
  scrollLeft?: number;
  scrollTop?: number;
  handleSize?: number;
}

function length(value: string, parent = 0): number {
  const number = Number.parseFloat(value);
  if (!Number.isFinite(number)) return 0;
  return value.endsWith("%") ? (number * parent) / 100 : number;
}

function translation(transform: string): { x: number; y: number } {
  const matrix = /^matrix\(([^)]+)\)$/.exec(transform);
  if (matrix) {
    const values = matrix[1]!.split(",").map(Number);
    return { x: values[4] ?? 0, y: values[5] ?? 0 };
  }
  const match = /translate(?:3d)?\(\s*([^,\s)]+)[,\s]+([^,)]+)/.exec(transform);
  return { x: length(match?.[1] ?? ""), y: length(match?.[2] ?? "") };
}

function rect(
  left: number,
  top: number,
  width: number,
  height: number
): DOMRect {
  return {
    x: left,
    y: top,
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
    toJSON() {
      return {
        x: left,
        y: top,
        left,
        top,
        width,
        height,
        right: left + width,
        bottom: top + height
      };
    }
  };
}

/** Supply jsdom's missing layout using the styles rendered by the real grid. */
export function installGridGeometry(
  container: HTMLElement,
  options: GeometryOptions = {}
): { refresh: () => void; uninstall: () => void } {
  const saved = new Map<
    HTMLElement,
    Map<string, PropertyDescriptor | undefined>
  >();
  const scale = options.scale ?? 1;
  const left = options.gridOffset?.left ?? options.left ?? 0;
  const top = options.gridOffset?.top ?? options.top ?? 0;
  const handleSize = options.handleSize ?? 20;
  let installed = true;

  function stub(
    node: HTMLElement,
    name: string,
    descriptor: PropertyDescriptor
  ) {
    let properties = saved.get(node);
    if (!properties) {
      properties = new Map();
      saved.set(node, properties);
    }
    if (properties.has(name)) return;
    properties.set(name, Object.getOwnPropertyDescriptor(node, name));
    Object.defineProperty(node, name, { configurable: true, ...descriptor });
  }

  function installGrid(grid: HTMLElement) {
    const gridWidth = () => options.width ?? (length(grid.style.width) || 1200);
    const gridHeight = () =>
      options.height ?? (length(grid.style.height) || 600);
    stub(grid, "scrollLeft", {
      writable: true,
      value: options.scroll?.left ?? options.scrollLeft ?? grid.scrollLeft
    });
    stub(grid, "scrollTop", {
      writable: true,
      value: options.scroll?.top ?? options.scrollTop ?? grid.scrollTop
    });
    stub(grid, "getBoundingClientRect", {
      value: () => rect(left, top, gridWidth() * scale, gridHeight() * scale)
    });
    dimensions(grid, gridWidth, gridHeight);

    grid.querySelectorAll<HTMLElement>(".react-grid-item").forEach(item => {
      // A nested grid installs its own items against its own container.
      if (item.closest(".react-grid-layout") !== grid) return;
      const width = () => length(item.style.width, gridWidth());
      const height = () => length(item.style.height, gridHeight());
      const position = () => {
        const translated = translation(item.style.transform);
        return {
          x: length(item.style.left, gridWidth()) + translated.x,
          y: length(item.style.top, gridHeight()) + translated.y
        };
      };
      stub(item, "offsetParent", { get: () => grid });
      stub(item, "getBoundingClientRect", {
        value: () => {
          const { x, y } = position();
          return rect(
            left + (x - grid.scrollLeft) * scale,
            top + (y - grid.scrollTop) * scale,
            width() * scale,
            height() * scale
          );
        }
      });
      dimensions(item, width, height);

      item
        .querySelectorAll<HTMLElement>(".react-resizable-handle")
        .forEach(handle => {
          if (handle.closest(".react-grid-item") !== item) return;
          const handleWidth = () => length(handle.style.width) || handleSize;
          const handleHeight = () => length(handle.style.height) || handleSize;
          stub(handle, "offsetParent", { get: () => item });
          dimensions(handle, handleWidth, handleHeight);
          stub(handle, "getBoundingClientRect", {
            value: () => {
              const axis =
                /(?:^|\s)react-resizable-handle-(n|s|e|w|ne|nw|se|sw)(?:\s|$)/.exec(
                  handle.className
                )?.[1] ?? "se";
              const parent = item.getBoundingClientRect();
              const w = handleWidth();
              const h = handleHeight();
              const tx = translation(handle.style.transform);
              const x = handle.style.left
                ? length(handle.style.left, width()) +
                  length(handle.style.marginLeft)
                : handle.style.right
                  ? width() - length(handle.style.right, width()) - w
                  : axis.includes("w")
                    ? 0
                    : axis.includes("e")
                      ? width() - w
                      : (width() - w) / 2;
              const y = handle.style.top
                ? length(handle.style.top, height()) +
                  length(handle.style.marginTop)
                : handle.style.bottom
                  ? height() - length(handle.style.bottom, height()) - h
                  : axis.includes("n")
                    ? 0
                    : axis.includes("s")
                      ? height() - h
                      : (height() - h) / 2;
              return rect(
                parent.left + (x + tx.x) * scale,
                parent.top + (y + tx.y) * scale,
                w * scale,
                h * scale
              );
            }
          });
        });
    });
  }

  function dimensions(
    node: HTMLElement,
    width: () => number,
    height: () => number
  ) {
    for (const name of ["clientWidth", "offsetWidth"])
      stub(node, name, { get: width });
    for (const name of ["clientHeight", "offsetHeight"])
      stub(node, name, { get: height });
  }

  function refresh() {
    if (!installed) return;
    if (container.matches(".react-grid-layout")) installGrid(container);
    container
      .querySelectorAll<HTMLElement>(".react-grid-layout")
      .forEach(installGrid);
  }

  function uninstall() {
    if (!installed) return;
    installed = false;
    for (const [node, properties] of saved) {
      for (const [name, descriptor] of properties) {
        if (descriptor) Object.defineProperty(node, name, descriptor);
        else Reflect.deleteProperty(node, name);
      }
    }
    saved.clear();
  }

  refresh();
  return { refresh, uninstall };
}
