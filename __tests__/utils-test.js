import {bottom, collides, validateLayout, moveElement, compact} from '../lib/utils.js';

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
      true, true // isUserAction, preventCollision
    )).toEqual([{x: 0, y: 1, w: 1, h: 1, moved: false}, {x: 1, y: 2, w: 1, h: 1, moved: false}]);
  });

  it('Does change layout when colliding in rearrangement mode', () => {
    const layout = [{x: 0, y: 0, w: 1, h: 1, moved: false}, {x: 1, y: 0, w: 1, h: 1, moved: false}];
    const layoutItem = layout[0];
    expect(moveElement(
      layout, layoutItem,
      1, 0, // x, y
      true, false, // isUserAction, preventCollision
      'vertical', 2 // compactType, cols
    )).toEqual([{x: 1, y: 0, w: 1, h: 1, moved: true}, {x: 1, y: 1, w: 1, h: 1, moved: true}]);
  });

  it('Does move elements out of the way without causing panel jumps when compaction is vertical', () => {
    const layout = [
      {x: 0, y: 0,  w: 1,  h: 10, moved: false, i: 'A'},
      {x: 0, y: 11, w: 10, h: 1,  moved: false, i: 'B'},
      {x: 0, y: 12, w: 1,  h: 1,  moved: false, i: 'C'},
    ];
    // move A down slightly so it collides C will can cause C to jump above B
    // this test will check that that does not happen
    const layoutItem = layout[0];
    expect(moveElement(
      layout, layoutItem,
      0, 2, // x, y
      true, false, // isUserAction, preventCollision
      'vertical', 10 // compactType, cols
    )).toEqual([
      {x: 0, y: 2,  w: 1,  h: 10, moved: true, i: 'A'},
      {x: 0, y: 12, w: 10, h: 1,  moved: true, i: 'B'},
      {x: 0, y: 13, w: 1,  h: 1,  moved: true, i: 'C'},
    ]);
  });

  it('Does move elements out of the way without causing panel jumps when compaction is horizontal', () => {
    const layout = [
      {y: 0, x: 0,  h: 1,  w: 10, moved: false, i: 'A'},
      {y: 0, x: 11, h: 10, w: 1,  moved: false, i: 'B'},
      {y: 0, x: 12, h: 1,  w: 1,  moved: false, i: 'C'},
    ];
    // move A down slightly so it collides C will can cause C to jump above B
    // this test will check that that does not happen
    const layoutItem = layout[0];
    expect(moveElement(
      layout, layoutItem,
      2, 0, // x, y
      true, false, // isUserAction, preventCollision
      'horizontal', 10 // compactType, cols
    )).toEqual([
      {y: 0, x: 2,  h: 1,  w: 10, moved: true, i: 'A'},
      {y: 0, x: 12, h: 10, w: 1,  moved: true, i: 'B'},
      {y: 0, x: 13, h: 1,  w: 1,  moved: true, i: 'C'},
    ]);
  });
});

describe('compact vertical', () => {
  it('Removes empty vertical space above item', () => {
    const layout = [{x: 0, y: 1, w: 1, h: 1}];
    expect(compact(layout, 'vertical', 10)).toMatchObject([{x: 0, y: 0, w: 1, h: 1}]);
  });

  it('Resolve collision by moving item further down in array', () => {
    const layout = [
      {x: 0, y: 0, w: 1, h: 5, i: '1'},
      {x: 0, y: 1, w: 1, h: 1, i: '2'}
    ];
    expect(compact(layout, 'vertical', 10)).toMatchObject([
      {x: 0, y: 0, w: 1, h: 5},
      {x: 0, y: 5, w: 1, h: 1}
    ]);
  });

  it('Handles recurisive collision by moving new collisions out of the way before moving item down', () => {
    const layout = [
      {x: 0, y: 0, w: 2,  h: 5, i: '1'},
      {x: 0, y: 0, w: 10, h: 1, i: '2'},
      {x: 5, y: 1, w: 1,  h: 1, i: '3'},
      {x: 5, y: 2, w: 1,  h: 1, i: '4'},
      {x: 5, y: 3, w: 1,  h: 1, i: '5', static: true}
    ];
    expect(compact(layout, 'vertical', 10)).toMatchObject([
      {x: 0, y: 0, w: 2,  h: 5, i: '1'},
      {x: 0, y: 5, w: 10, h: 1, i: '2'},
      {x: 5, y: 6, w: 1,  h: 1, i: '3'},
      {x: 5, y: 7, w: 1,  h: 1, i: '4'},
      {x: 5, y: 3, w: 1,  h: 1, i: '5', static: true}
    ]);
  });
});

describe('compact horizontal', () => {
  it('compact horizontal should remove empty horizontal space to left of item', () => {
    const layout = [{x: 5, y: 5, w: 1, h: 1}];
    expect(compact(layout, 'horizontal', 10)).toMatchObject([{x: 0, y: 0, w: 1, h: 1}]);
  });

  it('Resolve collision by moving item further to the right in array', () => {
    const layout = [
      {y: 0, x: 0, h: 1, w: 5, i: '1'},
      {y: 0, x: 1, h: 1, w: 1, i: '2'}
    ];
    expect(compact(layout, 'horizontal', 10)).toMatchObject([
      {y: 0, x: 0, h: 1, w: 5},
      {y: 0, x: 5, h: 1, w: 1}
    ]);
  });

  it('Handles recurisive collision by moving new collisions out of the way before moving item to the right', () => {
    const layout = [
      {y: 0, x: 0, h: 2,  w: 5, i: '1'},
      {y: 0, x: 0, h: 10, w: 1, i: '2'},
      {y: 5, x: 1, h: 1,  w: 1, i: '3'},
      {y: 5, x: 2, h: 1,  w: 1, i: '4'},
      {y: 5, x: 2, h: 1,  w: 1, i: '5', static: true}
    ];
    expect(compact(layout, 'horizontal', 10)).toMatchObject([
      {y: 0, x: 0, h: 2,  w: 5, i: '1'},
      {y: 0, x: 5, h: 10, w: 1, i: '2'},
      {y: 5, x: 6, h: 1,  w: 1, i: '3'},
      {y: 5, x: 7, h: 1,  w: 1, i: '4'},
      {y: 5, x: 2, h: 1,  w: 1, i: '5', static: true}
    ]);
  });
});


