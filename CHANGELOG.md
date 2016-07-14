# Changelog

Prerelease
-----

#### Changed:

- Due to a change in React 15.2, passing the `_grid` property on DOM children generates an error.
  To compensate, we now error on the same and suggest using `data-grid` instead. Simply change any use of
  `_grid` to `data-grid`, or add your properties to the layout.

0.12.7 (Jun 29, 2016)
-----

- Prevent extraenous rerenders in `<ResponsiveReactGridLayout>` by using deep equality on layouts.

0.12.6 (Jun 5, 2016)
-----

- Fix blindingly obvious bug where mounted isn't set to true. Smack forehead.

0.12.5 (Jun 3, 2016)
-----

- Fixes for server rendering checksum failures.

0.12.4 (May 22, 2016)
-----

- Update to React-Draggable v2. Fixes: #241, #239, #24
  - v2 contains a number of bugfixes & enhancements for touchscreens, multitouch, and scrolling containers.

0.12.3 (May 3, 2016)
-----

- Bugfix: Rendering with new `breakpoints`/`cols` does not refresh the layout.
  Fixes #208 - thanks @damienleroux

0.12.2 (May 1, 2016)
------

- Bugfix: Fix warning about undefined `useCSSTransforms` when server-rendering.

0.12.1 (Apr 19, 2016)
------

- Bugfix: Don't set `layout` twice on width change. See #217 - thanks @damienleroux
- Enhancement: Add Flow type comments

0.12.0 (Apr 14, 2016)
------

- `<ReactGridLayout>` will no longer animate so severely on mount. See #212.
  - If you are using `<WidthProvider>`, you may notice that the container's width still shunts on mount.
    If you like, you may delay mounting by setting `measureBeforeMount={true}` on the wrapped element. This
    will eliminate the mounting animation completely.
  - If you enjoyed the old animation, set `useCSSTransforms={this.state.mounted}` and toggle the mounting
    flag. See `0-showcase.jsx` for an example.
- Set more permissive version ranges for `<Draggable>` and `<Resizable>` dependencies, as they are now stable
  and will only introduce breaking changes on major version ticks.

0.11.3 (Apr 8, 2016)
------

- Officially support React v15.

0.11.2 (Apr 6, 2016)
------

- Bugfix: Draggable cancel selectors, see #203 - thanks @RiiD
- README fixes, thanks @bravo-kernel & @ro-savage

0.11.1
------

- Bugfix: `<ResponsiveReactGridLayout>` was using stale data when synchronizing children with the layout
  on a breakpoint change.

0.11.0
------

This release contains potentially breaking changes so I have updated the minor version (as per semver).

**Breaking Changes**:

- Layout items now have a fixed set of properties. Other properties will *not* be merged into the `<GridItem>`, such
  as `className`. To set a `className` on a child, set it on the child directly and it will be merged.
  This allows us to make better assumptions about the layout and use a faster cloning mechanism.
- Setting individual `handle` and `cancel` selectors per item is no longer supported. If you need this, please
  open a ticket and let me know your use case.

Other changes:

- Bugfix: `<ResponsiveReactGridLayout>` `onLayoutChange` callback data could still be stale.
- Bugfix: Range error when building layout solely from `_grid` properties.
  - This broke a lot of usage and thus `0.10.11` and `0.10.10` have been unpublished.
- Removed redundant `isPlaceholder` property from `<GridItem>`.
- README updates to clarify layout/_grid usage.

0.10.11
-------

- Bugfix: `layouts` param on `<ResponsiveReactGridLayout>`'s `onLayoutChange` could have stale data
  for the current breakpoint.

0.10.10
-------

- Performance: Prevent V8 deopt in a few methods and add fast layout item cloning.

0.10.9
------

- Bugfix: Typo in children comparison in CWRP. See #169.
- Bugfix: Missing babel-preset-es2015 in dev.

0.10.8
------

- Rebuild using [ES2015 Loose Mode](https://babeljs.algolia.com/docs/advanced/loose/).

0.10.7
------

- Bugfix: `className` and `style` props on grid children were being incorrectly dropped, a holdover
  from when `cloneWithProps()` used to do this merging for us. They are now merged.

0.10.6
------

- Bugfix: If both `props.layout` and `props.children.length` change in the same tick,
  props.layout would be clobbered. See #162

0.10.5
------

- Bugfix/Enhancement: Margins were causing subtle error in some of the positioning calculations. This has
  been fixed.

0.10.4
------

- Bugfix: Container height was calculated as less than expected due to improper addition of margin.

0.10.3
------

- Bugfix: Round item positions even if they're currently resizing or dragging (#158, regression of #141)
- Bugfix: Fix a positioning bug when margins are 0 (#160)

0.10.2
------

- Bugfix: <RGL> would synchronize children with layout if the layout in props didn't match the state;
  this was meant to be a hook for the developer to supply a new layout. The incorrect check could cause the
  layout to reset if the parent rerendered. The check is now between the layout in nextProps and props.
- Bugfix: Fixed a lot of resizing layout bugs; most of the fixes are in react-resizable.
- Bugfix: Fixed incorrect typecheck on LayoutItem.i.
- Bugfix: Make onLayoutChange fire appropriately (#155).
- Bugfix: Fix `<ResponsiveGridLayout>` not properly reverting when sizing the page up (#154).
- Remove unused `offsetX` and `offsetY` from layouts.
- Dependency updates.

0.10.1
------

- Hotfix for default export incompatibility caused by Babel 6.

0.10.0
------

This long-awaited release provides React 0.14 compatibility and a rewrite of the underlying
`<Draggable>` functionality.

**Breaking changes:**

- `ListensToWidth` replaced with `WidthProvider` which must wrap
  `<ResponsiveReactGridLayout>` and `<ReactGridLayout>` to provide width data. See doc for example.
- Prop `initialWidth` renamed to `width`.
- Grid Layout keys must be type of string now.

Other changes:

- *Finally* compatible with React 0.14! Big thanks to @menelike for his help.
- Upgraded to Babel 6.
- Full typechecking via Flow.
- Lots of misc bugfixes.
  - See beta releases below for more details.

0.10.0-beta1
------------

- Fixed a React import bug on ListensToWidth.jsx (#130; thanks @mrblueblue)

0.10.0-beta0
------------

*This release is unstable!*

- React 0.14 compatibility.
- This release includes a rewrite of much of the project in ES6/7 style with Flow typing.
- This release brings us onto mainline (1.x) react-draggable and react-resizable, eliminating
  the previous github dependency.
- 0.10.0 is not yet complete. Use this release at your own risk.

Known bugs:
  - The placeholder box does not properly follow the mouse and stays pinned to the active drag.

0.9.2
-----

- Update `react-draggable` to `v0.8.0` to fix IE11 issues (#29).

0.9.1
-----

- Update `react-draggable` to `v0.7.3` to fix a bounds bug (#56).

0.9.0
-----

- Move off `react-draggable` fork to mainline `v0.7.2`. Incremented minor (major in the case of
  npm's `^`, since we are pre-v1) version in case of unforeseen conflicts.

0.8.3
-----

- Add `verticalCompact` toggle.

0.8.2
-----

- Fix a crash when initializing with no children.

0.8.1
-----

- Fixed React 0.13 warning about `isMounted()`.
- Update to babel 5.
- Added browser build for use with a `<script>` tag or in RequireJS builds.
- Pinned react-draggable version in anticipation of React 0.13 update.

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

**Breaking changes:**

- `ReactGridLayout.props.handle` renamed to `ReactGridLayout.props.draggableHandle`.

> This version contains a CSS update. This fixes a visual bug where you may see items quickly reset position
  and animate back to their original position on load, when you are using CSS transforms. To fix this bug,
  copy the rules from css/styles.css into your stylesheet.

Other changes:

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
