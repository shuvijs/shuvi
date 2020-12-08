/**
 * @jest-environment jsdom
 */

import { Component } from 'react';
import * as ReactDOM from 'react-dom';
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

    class Home extends Component {
      componentDidMount() {
        mountCount += 1;
      }
      render() {
        return <h1>Home</h1>;
      }
    }

    act(() => {
      ReactDOM.render(
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
        </Router>,
        node
      );
    });

    expect(node.innerHTML).toMatchInlineSnapshot(`"<h1>Home</h1>"`);
    expect(mountCount).toBe(1);

    act(() => {
      ReactDOM.render(
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
        </Router>,
        node
      );
    });

    expect(node.innerHTML).toMatchInlineSnapshot(`"<h1>Home</h1>"`);
    expect(mountCount).toBe(1);
  });
});
