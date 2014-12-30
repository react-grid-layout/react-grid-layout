### React-Grid-Layout

[View the Demo](https://strml.github.io/react-grid-layout/examples/1-basic.html)

React-Grid-Layout is a grid layout system much like [Packery](http://packery.metafizzy.co/) or 
[Gridster](http://gridster.net), for React. 

RGL is not as full-featured as the above projects. However, it solves a major pain point I've found with those
projects - it is responsive! Try resizing the window in the demo and see how the grid resizes without any fuss.

RGL works just fine with server-side rendering.

RGL is React-only and does not require jQuery.

More demos are coming soon. RGL supports adding and removing components without fuss.

If you have a feature request, please add it as an issue or make a pull request.

#### Features

* 100% React - no jQuery
* Draggable widgets
* Resizable widgets
* Vertical auto-packing
* Bounds checking for dragging and resizing
* Layout can be serialized and restored
* Responsive breakpoints
* Separate layouts per responsive breakpoints


#### Usage

Use ReactGridLayout like any other component.

```javascript

render: function() {
  // layout is an array of objects, see the demo
  var initialLayout = getOrGenerateLayout(); 
  return (
    <ReactGridLayout className="layout" initialLayout={initialLayout} 
      cols={12} rowHeight={30}>
      <div key={1}>1</div>
      <div key={2}>2</div>
      <div key={3}>3</div>
    </ReactGridLayout>
  )
}

```

You can also set layout properties directly on the children:


```javascript

render: function() {
  // layout is an array of objects, see the demo
  return (
    <ReactGridLayout className="layout" cols={12} rowHeight={30}>
      <div key={1} _grid={{x: 0, y: 0, w: 1: h: 2}}>1</div>
      <div key={2} _grid={{x: 1, y: 0, w: 1: h: 2}}>2</div>
      <div key={3} _grid={{x: 2, y: 0, w: 1: h: 2}}>3</div>
    </ReactGridLayout>
  )
}

```


#### Props

RGL supports the following properties (see the source for the final word on this):

```javascript
// If true, the container height swells and contracts to fit contents
autoSize: React.PropTypes.bool,

// {name: pxVal}, e.g. {lg: 1200, md: 996, sm: 768, xs: 480}
breakpoints: React.PropTypes.object,

// Can be specified as a single number or a {breakpoint: cols} map
cols: React.PropTypes.oneOfType([
  React.PropTypes.object,
  React.PropTypes.number
]),

// A selector for the draggable handler
handle: React.PropTypes.string,

// Layout is an array of object with the format:
// {x: Number, y: Number, w: Number, h: Number}
initialLayout: React.PropTypes.array,

// This allows setting this on the server side
initialWidth: React.PropTypes.number,

// margin between items [x, y] in px
margin: React.PropTypes.array,

// Rows have a static height, but you can change this based on breakpoints 
// if you like
rowHeight: React.PropTypes.number,

// Flags.
isDraggable: React.PropTypes.bool,
isResizable: React.PropTypes.bool,

// Callback so you can save the layout
onLayoutChange: React.PropTypes.func
```

###### Defaults

```javascript
{
  autoSize: true,
  breakpoints: {lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0},
  cols: 10, 
  rowHeight: 150,
  initialWidth: 1280,
  margin: [10, 10],
  isDraggable: true,
  isResizable: true,
  onLayoutChange: function(){}
}
```


#### Demos

1. [Basic](https://strml.github.io/react-grid-layout/examples/1-basic.html)
1. [No Dragging/Resizing (Layout Only)](https://strml.github.io/react-grid-layout/examples/2-no-dragging.html)
1. [Messy Layout Autocorrect](https://strml.github.io/react-grid-layout/examples/3-messy.html)
1. [Layout defined on children](https://strml.github.io/react-grid-layout/examples/4-grid-property.html)

----

#### TODO List

- [x] Basic grid layout
- [x] Fluid grid layout
- [x] Grid packing
- [x] Draggable grid items
- [x] Live grid packing while dragging
- [x] Resizable grid items
- [x] Layouts per responsive breakpoint
- [x] Define grid attributes on children themselves (`_grid` key)
- [ ] Min/max w/h per item
- [ ] Resizable handles on other corners
- [ ] Configurable w/h per breakpoint
