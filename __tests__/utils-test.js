import {bottom, collides, validateLayout, moveElement} from '../lib/utils.js';

describe('bottom', () => {
  it('Handles an empty layout as input', () => {
    expect(bottom([])).toBe(0);
  });

  it('Returns the bottom coordinate of the layout', () => {
    expect(bottom([
      {x: 0, y: 1, w: 1, h: 1},
      {x: 1, y: 2, w: 1, h: 1}
    ])).toBe(3);
  });
});

describe('collides', () => {
  it('Returns whether the layout items collide', () => {
    expect(collides(
      {x: 0, y: 1, w: 1, h: 1},
      {x: 1, y: 2, w: 1, h: 1}
    )).toBe(false);
    expect(collides(
      {x: 0, y: 1, w: 1, h: 1},
      {x: 0, y: 1, w: 1, h: 1}
    )).toBe(true);
  });
});

describe('validateLayout', () => {
  it('Validates an empty layout', () => {
    validateLayout([]);
  });
  it('Validates a populated layout', () => {
    validateLayout([
      {x: 0, y: 1, w: 1, h: 1},
      {x: 1, y: 2, w: 1, h: 1}
    ]);
  });
  it('Throws errors on invalid input', () => {
    expect(() => {
      validateLayout([
        {x: 0, y: 1, w: 1, h: 1},
        {x: 1, y: 2, w: 1}
      ]);
    }).toThrowError('Layout[1].h must be a number!');
  });
});

describe('moveElement', () => {
  it('Does not change layout when colliding on no rearrangement mode', () => {
    const layout = [{x: 0, y: 1, w: 1, h: 1, moved: false}, {x: 1, y: 2, w: 1, h: 1, moved: false}];
    const layoutItem = layout[0];
    expect(moveElement(
      layout, layoutItem,
      1, 2, // x, y
      true, false // isUserAction, isRearrangeable
    )).toEqual([{x: 0, y: 1, w: 1, h: 1, moved: false}, {x: 1, y: 2, w: 1, h: 1, moved: false}]);
  });
  it('Does change layout when colliding in rearrangement mode', () => {
    const layout = [{x: 0, y: 0, w: 1, h: 1, moved: false}, {x: 1, y: 0, w: 1, h: 1, moved: false}];
    const layoutItem = layout[0];
    expect(moveElement(
      layout, layoutItem,
      1, 0, // x, y
      true, true // isUserAction, isRearrangeable
    )).toEqual([{x: 1, y: 0, w: 1, h: 1, moved: true}, {x: 1, y: 1, w: 1, h: 1, moved: true}]);
  });
});
