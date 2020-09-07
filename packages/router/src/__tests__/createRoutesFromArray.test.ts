import { createRoutesFromArray } from '../createRoutesFromArray';

describe('createRoutesFromArray', () => {
  it('should handle empty array', () => {
    expect(createRoutesFromArray([]).length).toBe(0);
  });

  it('should create routes', () => {
    const Comp1 = () => 'element1';
    expect(
      createRoutesFromArray([
        {
          path: '/',
          component: Comp1
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
      { caseSensitive: false, component: Comp1, path: '/' },
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
