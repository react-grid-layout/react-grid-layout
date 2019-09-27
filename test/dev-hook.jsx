import 'react-hot-loader';
import { hot } from 'react-hot-loader/root';
const DevLayout = require('./examples/0-showcase.jsx');
const makeLayout = require('./test-hook');

const Layout = makeLayout(DevLayout);

export default hot(Layout);
