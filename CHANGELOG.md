0.8.0
-----

- Changed signature on resize/drag callbacks to allow dynamic max/min W/H per item.
- Fixed bug in `useCSSTransforms`.
- Documentation and example fixes.

0.7.1
-----

- Added callbacks for resize and drag start/active/stop.

0.7.0
-----

> Breaking changes: `ReactGridLayout.props.handle` renamed to `ReactGridLayout.props.draggableHandle`.

> This version contains a CSS update. This fixes a visual bug where you may see items quickly reset position
  and animate back to their original position on load, when you are using CSS transforms. To fix this bug,
  copy the rules from css/styles.css into your stylesheet.

- Fixed #19 (bad new item placement with css transforms).
- Fixed some placement inconsistencies while RGL is mounting, with css transforms and percentages.
- Fixed a duplicate className bug.


0.6.2
-----

- Fix #21 (error when passing only a single child).
- Add GridItem.props.cancel.
- Use React addons directly to save file size.
- Allow setting draggable/resizable per grid item, as well as existing `static` property.
- Use object.assign to set `_grid` properties so we can more easily merge PRs in the future.

0.6.1
-----

- Fixed #8 (current layout was not properly being stored when provided via _grid props).

0.6.0
-----

- Optionally use CSS transforms for placement, fallback on position top/left.
- Allow parent to set responsive breakpoint directly.

0.5.2
-----

- Fix Responsive import for node users

0.5.1
-----

- Add support for min/max dimension attributes.
- Example tweak

0.5.0
-----
- Refactoring and demo tweaks. Update README with new params.
- Add showcase example, tweak template
- Refactor: Responsive Grid Layout is a separate element
- Auto-generate examples from template rather than edit them individually.

0.4.0
-----

- Force lodash into commons chunk
- More tweaks to grid collisions. This should fix bad swaps once and for all.
- Set unused:"vars" in lint.
- Add responsive localstorage example and `initialLayouts` support.
- Fix localstorage example comment.
- Rework responsive layouts, identify child elements by key rather than index. Added 2 new examples.
- Fixup GridItem resizing feel a bit.

< 0.4.0
-------

- Early development versions, too many changes to list.
