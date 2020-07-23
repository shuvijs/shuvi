import { createRoutesFromArray } from '../createRoutesFromArray';
import { DUMMY_ELEMENT } from './utils';

describe('createRoutesFromArray', () => {
  it('should handle empty array', () => {
    expect(createRoutesFromArray([], DUMMY_ELEMENT).length).toBe(0);
  });

  it('should create routes', () => {
    const ELEMENT1 = () => 'element1';
    expect(
      createRoutesFromArray(
        [
          {
            path: '/',
            element: ELEMENT1
          },
          {
            path: '/:id',
            caseSensitive: true,
            children: [
              {
                path: '/children'
              }
            ]
          },
          {
            path: '/test/123'
          }
        ],
        DUMMY_ELEMENT
      )
    ).toStrictEqual([
      { caseSensitive: false, element: ELEMENT1, path: '/' },
      {
        caseSensitive: true,
        element: DUMMY_ELEMENT,
        path: '/:id',
        children: [
          {
            path: '/children',
            element: DUMMY_ELEMENT,
            caseSensitive: false
          }
        ]
      },
      { caseSensitive: false, element: DUMMY_ELEMENT, path: '/test/123' }
    ]);
  });

  it('should handle empty object', () => {
    expect(createRoutesFromArray([{}], DUMMY_ELEMENT)).toStrictEqual([
      { caseSensitive: false, element: DUMMY_ELEMENT, path: '/' }
    ]);
  });
});
