import ResizableHandles from './20-resizable-handles';

if (process.env.STATIC_EXAMPLES === true) {
  import("../test-hook.jsx").then(fn => fn.default(ResizableHandles));
}
