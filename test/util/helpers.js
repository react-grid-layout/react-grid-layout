// @flow

import * as React from 'react';
import {render} from '@testing-library/react';
import type {RenderResult} from '@testing-library/react';

// Usage:
//
//  const {instanceRef} = renderWithInstance(<GridItem {...mockProps} onDrag={() => {}} />);
//  instanceRef.current.someFn();
//
export function renderWithInstance(element: React.MixedElement): {...RenderResult<any>, instanceRef: React.MixedElement} {
  let instanceRef = { current: null }
  const renderResult = render(React.cloneElement(element, {ref: instanceRef}));
  return { ...renderResult, instanceRef }
};

export function rerenderWithInstance(wrapper: RenderResult<any>, element: React.MixedElement): {...RenderResult<any>, instanceRef: React.MixedElement} {
  let instanceRef = { current: null }
  const renderResult = wrapper.rerender(React.cloneElement(element, {ref: instanceRef}));
  return { ...wrapper, instanceRef }
};