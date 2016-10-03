// @flow
import React from 'react';
import _ from 'lodash';
import {shallow, mount} from 'enzyme';
import assert from 'power-assert';
import sinon from 'sinon';
import ReactGridLayout from '../../lib/ReactGridLayout';

describe('<ReactGridLayout />', () => {
  it('renders an <ReactGridLayout> with children', () => {
    const wrapper = shallow(<ReactGridLayout />);
    assert(wrapper.find(ReactGridLayout).length === 1);
    // You can also do it by displayName
    assert(wrapper.find('ReactGridLayout').length === 1);
  });
});

