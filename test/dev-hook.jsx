import "react-hot-loader";
import { hot } from "react-hot-loader/root";
import DevLayout from "./examples/00-showcase.jsx";
import makeLayout from "./test-hook";
import "react-grab";

const Layout = makeLayout(DevLayout);

export default hot(Layout);
