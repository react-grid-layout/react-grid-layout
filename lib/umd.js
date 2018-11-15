import * as utils from "./utils";
import * as responsiveUtils from "./responsiveUtils";
import GridLayout from "./ReactGridLayout";
import ResponsiveGridLayout from "./ResponsiveReactGridLayout";
import WidthProvider from "./components/WidthProvider";

GridLayout.utils = utils;
GridLayout.Responsive = ResponsiveGridLayout;
GridLayout.Responsive.utils = responsiveUtils;
GridLayout.WidthProvider = WidthProvider;

export default GridLayout;
