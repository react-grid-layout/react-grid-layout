import React from "react";
import _ from "lodash";
import RGL, { WidthProvider } from "react-grid-layout";

const ReactGridLayout = WidthProvider(RGL);

export default class ResizeStepTest extends React.PureComponent {
  static defaultProps = {
    className: "layout",
    items: 4,
    rowHeight: 30,
    onLayoutChange: function() {},
    cols: 12,
    resizeStep: 3 // Test with resize step of 3
  };

  constructor(props) {
    super(props);
    
    // Ensure resizeStep has a default value
    this.resizeStep = props.resizeStep || 3;
    
    const layout = this.generateLayout();
    this.state = { layout };
  }

  generateDOM() {
    return _.map(_.range(this.props.items), function(i) {
      return (
        <div key={i} className="grid-item" style={{
          background: '#ddd',
          border: '1px solid #999',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold'
        }}>
          <div>
            <div>Item {i}</div>
            <div style={{fontSize: '10px', color: '#666'}}>
              Try resizing me!
            </div>
          </div>
        </div>
      );
    });
  }

  generateLayout() {
    const p = this.props;
    return _.map(new Array(p.items), function(item, i) {
      return {
        x: i * 3, // Start at positions 0, 3, 6, 9
        y: 0,
        w: 3, // Start with width that's a multiple of resizeStep
        h: 3, // Start with height that's a multiple of resizeStep
        i: i.toString()
      };
    });
  }

  onLayoutChange(layout) {
    this.props.onLayoutChange(layout);
    this.setState({ layout });
  }

  onResize(layout, oldItem, newItem) {
    console.log('🔄 Resize event:', {
      oldItem: `[${oldItem.x}, ${oldItem.y}, ${oldItem.w}, ${oldItem.h}]`,
      newItem: `[${newItem.x}, ${newItem.y}, ${newItem.w}, ${newItem.h}]`,
      resizeStep: this.resizeStep,
      widthChange: newItem.w - oldItem.w,
      heightChange: newItem.h - oldItem.h
    });
  }

  render() {
    return (
      <div style={{padding: '20px'}}>
        <div style={{
          background: '#f0f8ff',
          padding: '15px',
          marginBottom: '20px',
          border: '2px solid #007acc',
          borderRadius: '5px'
        }}>
          <h2 style={{margin: '0 0 10px 0', color: '#007acc'}}>
            🎯 Test de ResizeStep
          </h2>
          <p style={{margin: '5px 0'}}>
            <strong>Resize Step: {this.resizeStep}</strong>
          </p>
          <p style={{margin: '5px 0'}}>
            Les éléments ne peuvent être redimensionnés que par pas de {this.resizeStep}.
          </p>
          <p style={{margin: '5px 0', color: '#666'}}>
            Tailles valides: {this.resizeStep}, {this.resizeStep * 2}, {this.resizeStep * 3}, {this.resizeStep * 4}...
          </p>
          <p style={{margin: '5px 0', color: '#666'}}>
            Ouvrez la console pour voir les logs de redimensionnement.
          </p>
        </div>
        
        <ReactGridLayout
          layout={this.state.layout}
          onLayoutChange={this.onLayoutChange}
          onResize={this.onResize}
          resizeStep={this.resizeStep}
          isResizable={true}
          isDraggable={true}
          {...this.props}
        >
          {this.generateDOM()}
        </ReactGridLayout>
      </div>
    );
  }
}

if (process.env.STATIC_EXAMPLES === true) {
  import("../test-hook.jsx").then(fn => fn.default(ResizeStepTest));
}
