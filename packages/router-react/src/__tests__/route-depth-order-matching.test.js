import * as React from 'react';
import { act, create as createTestRenderer } from 'react-test-renderer';
import { MemoryRouter as Router, RouterView } from '..';

describe('nested /', () => {
  it('matches them depth-first', () => {
    let renderer;
    act(() => {
      renderer = createTestRenderer(
        <Router
          initialEntries={['/']}
          routes={[
            {
              path: '/',
              element: <First />,
              children: [
                {
                  path: '/',
                  element: <Second />,
                  children: [
                    {
                      path: '/',
                      element: <Third />
                    }
                  ]
                }
              ]
            }
          ]}
        >
          <RouterView />
        </Router>
      );
    });

    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <div>
        First 
        <div>
          Second 
          <div>
            Third
          </div>
        </div>
      </div>
    `);
  });

  function First() {
    return (
      <div>
        First <RouterView />
      </div>
    );
  }

  function Second() {
    return (
      <div>
        Second <RouterView />
      </div>
    );
  }

  function Third() {
    return <div>Third</div>;
  }
});

describe('routes with identical paths', () => {
  it('matches them in order', () => {
    let renderer;
    act(() => {
      renderer = createTestRenderer(
        <Router
          initialEntries={['/home']}
          routes={[
            {
              path: '/home',
              element: <First />
            },
            {
              path: '/home',
              element: <Second />
            }
          ]}
        >
          <RouterView />
        </Router>
      );
    });

    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <div>
        First
      </div>
    `);
  });

  function First() {
    return <div>First</div>;
  }

  function Second() {
    return <div>Second</div>;
  }
});
