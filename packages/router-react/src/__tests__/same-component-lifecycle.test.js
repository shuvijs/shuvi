/**
 * @jest-environment jsdom
 */

import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import { MemoryRouter as Router, RouterView } from '..';

describe('when the same component is mounted by two different routes', () => {
  let node;
  beforeEach(() => {
    node = document.createElement('div');
    document.body.appendChild(node);
  });

  afterEach(() => {
    document.body.removeChild(node);
    node = null;
  });

  it('mounts only once', () => {
    let mountCount = 0;
    let renderRoot;
    class Home extends React.Component {
      componentDidMount() {
        mountCount += 1;
      }
      render() {
        return <h1>Home</h1>;
      }
    }
    renderRoot = createRoot(node);
    act(() => {
      renderRoot.render(
        <Router
          initialEntries={['/home']}
          routes={[
            {
              path: 'home',
              component: Home
            },
            {
              path: 'another-home',
              component: Home
            }
          ]}
        >
          <RouterView />
        </Router>
      );
    });

    expect(node.innerHTML).toMatchInlineSnapshot(`"<h1>Home</h1>"`);
    expect(mountCount).toBe(1);

    act(() => {
      renderRoot.render(
        <Router
          initialEntries={['/another-home']}
          routes={[
            {
              path: 'home',
              component: Home
            },
            {
              path: 'another-home',
              component: Home
            }
          ]}
        >
          <RouterView />
        </Router>
      );
    });

    expect(node.innerHTML).toMatchInlineSnapshot(`"<h1>Home</h1>"`);
    expect(mountCount).toBe(1);
  });
});
