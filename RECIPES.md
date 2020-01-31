# Recipes

Those recipes are community contributions.

## Access the current breakpoint in responsive mode

The `WidthProvider` component provides a `width` prop to its child.
Using an intermediate component, you can access this width and easily compute the current breakpoint.

```
import { Responsive, WidthProvider } from 'react-grid-layout'
import { getBreakpointFromWidth } from 'react-grid-layout/lib/responsiveUtils.js'


const IntermediateGrid = ({width, ...otherProps}) => {
    console.log("current breakpoint:", getBreakpointFromWidth(yourBreakpoints, width)
    return <Reponsive width={width} {...otherProps} />
}
const FullGrid = WidthProvider(IntermediateGrid);
```

## Access the current layout

In non responsive mode, use the `onLayoutChange` callback to store the layout. 
In responsive mode, you may also need to track the breakpoint to select the correct layout in the `layouts` map: `layouts[currentBreakpoint]`.

## Provide an initial width/height to new items

You can systematically provide a `data-grid` prop to grid items. If the item has a layout, it will be ignored. 
If it doesn't, it will be used as the default layout. Therefore you can use it to define the initial width/height
of new items that do not yet possess a layout.

However you will also need to define default `x` and `y`, even if you only want to modify the size of new items.
You can set `x` to 0. You can also set `y` to 0 but it may interfere with existing items.

If your grid is compacted vertically, you can use `y=Infinity`. 
Otherwise, you may want to compute the bottom from the current layout, see the example below. 

```
import { bottom } from 'react-grid-layout/lib/utils'

...

<GridItem key="wathever" data-grid={{w:4, h:4, x:0, y: bottom(layout)}} />
```
