// @flow
/* eslint-env jest */

import React from 'react';
import _ from 'lodash';
import ResponsiveReactGridLayout from '../../lib/ResponsiveReactGridLayout';
import ReactGridLayout from '../../lib/ReactGridLayout';
import BasicLayout from '../examples/1-basic';
import ShowcaseLayout from '../examples/0-showcase';
import deepFreeze from '../util/deepFreeze';
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
      const wrapper = mount(<BasicLayout />);
      expect(wrapper).toMatchSnapshot();
    });
  });

  describe('<ResponsiveReactGridLayout>', function() {

    it('Basic Render', async function() {
      const wrapper = mount(<ShowcaseLayout />);
      expect(wrapper).toMatchSnapshot();
    });

    it('Does not modify layout on movement', async function() {
      const layouts = {
        lg: [
          ..._.times(3, (i) => ({
            i: String(i),
            x: i,
            y: 0,
            w: 1,
            h: 1,
          }))
        ]
      };
      const frozenLayouts = deepFreeze(layouts, {set: true, get: false /* don't crash on unknown gets */});
      // Render the basic Responsive layout.
      const wrapper = mount(
        <ResponsiveReactGridLayout layouts={frozenLayouts} width={1280} breakpoint="lg">
          {_.times(3, (i) => <div key={i} />)}
        </ResponsiveReactGridLayout>
      );

      // Set that layout as state and ensure it doesn't change.
      wrapper.setState({layouts: frozenLayouts});
      wrapper.setProps({width: 800, breakpoint: 'md'}); // will generate new layout
      wrapper.render();

      expect(frozenLayouts).not.toContain('md');
    });
  });
});