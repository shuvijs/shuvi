import { createRoutesFromArray } from '../createRoutesFromArray';

describe('createRoutesFromArray', () => {
  it('should handle empty array', () => {
    expect(createRoutesFromArray([]).length).toBe(0);
  });

  it('should create routes', () => {
    const ELEMENT1 = () => 'element1';
    expect(
      createRoutesFromArray([
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
      ])
    ).toStrictEqual([
      { caseSensitive: false, element: ELEMENT1, path: '/' },
      {
        caseSensitive: true,
        path: '/:id',
        children: [
          {
            path: '/children',
            caseSensitive: false
          }
        ]
      },
      { caseSensitive: false, path: '/test/123' }
    ]);
  });

  it('should handle empty object', () => {
    expect(createRoutesFromArray([{}])).toStrictEqual([
      { caseSensitive: false, path: '/' }
    ]);
  });
});
