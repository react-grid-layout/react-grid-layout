// @flow
/* eslint-env jest */

import React from 'react';
import ReactGridLayout from '../../lib/ReactGridLayout';
import BasicLayout from '../examples/1-basic';
import Chance from 'chance';
import {shallow, mount} from 'enzyme';

describe('Lifecycle tests', function() {

  // Example layouts use randomness
  beforeAll(() => {
    const chance = new Chance(1234);
    jest.spyOn(global.Math, 'random').mockImplementation(() => chance.random());
  });

  afterAll(() => {
    global.Math.random.mockRestore();
  });

  describe('<ReactGridLayout>', function() {
    it('Basic Render', async function() {
      const wrapper = shallow(<BasicLayout />);

      expect(wrapper).toMatchSnapshot();
    });
  });
});