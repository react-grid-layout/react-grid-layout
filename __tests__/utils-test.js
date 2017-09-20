import {bottom, collides, validateLayout} from '../lib/utils.js';

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
