// @flow

import Enzyme from "enzyme";
import Adapter from "enzyme-adapter-react-16";

Enzyme.configure({ adapter: new Adapter() });

// We rely on sort() being deterministic for tests, but it changed from QuickSort to TimSort
// in Node 12. This breaks tests, so we monkey-patch it.
import { sort } from "timsort";

// $FlowIgnore dirty hack
Array.prototype.sort = function (comparator) {
  sort(this, comparator);
  return this;
};

// Required in drag code, not working in JSDOM
Object.defineProperty(HTMLElement.prototype, "offsetParent", {
  get() {
    // $FlowIgnore[object-this-reference]
    return this.parentNode;
  }
});
