import TestUtils from "react-dom/test-utils";

export function touchStart(target) {
  const node = target.getDOMNode();
  const e = new TouchEvent("touchstart");
  node.dispatchEvent(e);
}

export function touchMove(target, x, y) {
  const node = target.getDOMNode();

  const touch = {
    identifier: "123",
    target: node,
    clientX: x,
    clientY: y
  };

  const touchEvent = new TouchEvent("touchmove", {
    touches: [touch],
    view: window,
    cancelable: true,
    bubbles: true,
    changedTouches: [touch],
    target: node
  });

  node.dispatchEvent(touchEvent);
  return touchEvent;
}

export function touchEnd(target) {
  const node = target.getDOMNode();
  const e = new TouchEvent("touchend");
  node.dispatchEvent(e);
}

export function mouseDown(target) {
  const node = target.getDOMNode();
  TestUtils.Simulate.mouseDown(node, {
    clientX: node.clientX,
    clientY: node.clientY
  });
}

export function mouseMove(target, x, y) {
  const node = target.getDOMNode();
  const doc = node ? node.ownerDocument : document;
  const evt = doc.createEvent("MouseEvents");
  evt.initMouseEvent(
    "mousemove",
    true,
    true,
    window,
    0,
    0,
    0,
    x,
    y,
    false,
    false,
    false,
    false,
    0,
    null
  );
  doc.dispatchEvent(evt);
  return evt;
}

export function mouseUp(target) {
  const node = target.getDOMNode();
  TestUtils.Simulate.mouseUp(node);
}
