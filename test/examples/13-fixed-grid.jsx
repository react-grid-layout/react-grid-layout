import React from 'react';
import _ from 'lodash';
import ReactGridLayout, {WidthProvider} from 'react-grid-layout';

const Grid = WidthProvider(ReactGridLayout);

const layout = [
	{w:256, h:160, x:0, y:0, i:"0"},
	{w:256, h:160, x:272, y:0, i:"1"},
	{w:256, h:160, x:0, y:352, i:"2"},
	{w:256, h:160, x:544, y:0, i:"3"},
	{w:256, h:160, x:0, y:176, i:"4", static: true},
	{w:528, h:336, x:272, y:176, i:"5"},
	{w:800, h:512, x:0, y:528, i:"6"}
];

class FixedGridLayout extends React.Component {

  state = {
		compactType: "vertical",
    mounted: false
  };

  componentDidMount() {
    this.setState({
			layout,
			mounted: true
		});
  }

	generateDOM() {
    return _.map(this.state.layout, function (l, i) {
      return (
        <div key={i} className={l.static ? 'static' : ''}>
          {l.static ?
            <span className="text" title="This item is static and cannot be removed or resized.">Static - {i}</span>
            : <span className="text">{i}</span>
          }
        </div>);
    });
  }

	onLayoutChange = (layout, layouts) => {
    this.props.onLayoutChange(layout, layouts);
  };

  onCompactTypeChange = () => {
    const {compactType: oldCompactType} = this.state;
    const compactType = oldCompactType === 'horizontal' ? 'vertical' :
                        oldCompactType === 'vertical' ? null : 'horizontal';

    this.setState({compactType});
  };

  render() {
		const {layout} = this.state;

    return (
			<div>
				<div>Compaction type: {_.capitalize(this.state.compactType) || 'No Compaction'}</div>
				<button onClick={this.onCompactTypeChange}>Change Compaction Type</button>
				<Grid
					{...this.props}
					style={{padding: 16}}
					colWidth={256}
					compactType={this.state.compactType}
					layout={layout}
					margin={[16, 16]}
					onLayoutChange={this.onLayoutChange}
					responsive={false}
					rowHeight={160}>
					{this.generateDOM()}
				</Grid>
			</div>
    );
  }

}

module.exports = FixedGridLayout;

if (require.main === module) {
  require('../test-hook.jsx')(module.exports);
}
