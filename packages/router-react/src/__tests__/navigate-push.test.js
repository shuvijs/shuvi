/**
 * @jest-environment jsdom
 */

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import { Router, useNavigate, RouterView } from '..';
import { createRouter, MemoryHistory } from '@shuvi/router';

function createMockRouter(routes, initialLocation) {
  return createRouter({
    routes,
    history: new MemoryHistory({
      initialEntries: [initialLocation],
      initialIndex: 0
    })
  });
}

describe('navigate', () => {
  let node;
  beforeEach(() => {
    node = document.createElement('div');
    document.body.appendChild(node);
  });

  afterEach(() => {
    document.body.removeChild(node);
    node = null;
  });

  describe('by default', () => {
    it('calls router.push()', () => {
      function Home() {
        let navigate = useNavigate();

        function handleClick() {
          navigate('/about');
        }

        return (
          <div>
            <h1>Home</h1>
            <button onClick={handleClick}>click me</button>
          </div>
        );
      }

      function About() {
        return <h1>About</h1>;
      }

      let router = createMockRouter(
        [
          {
            path: 'home',
            element: <Home />
          },
          {
            path: 'about',
            element: <About />
          }
        ],
        {
          pathname: '/home',
          search: '',
          hash: ''
        }
      );
      let spy = jest.spyOn(router, 'push');

      act(() => {
        ReactDOM.render(
          <Router router={router}>
            <RouterView />
          </Router>,
          node
        );
      });

      let button = node.querySelector('button');
      expect(button).not.toBeNull();

      act(() => {
        button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('with { replace: true }', () => {
    it('calls router.replace()', () => {
      function Home() {
        let navigate = useNavigate();

        function handleClick() {
          navigate('/about', { replace: true });
        }

        return (
          <div>
            <h1>Home</h1>
            <button onClick={handleClick}>click me</button>
          </div>
        );
      }

      function About() {
        return <h1>About</h1>;
      }

      let router = createMockRouter(
        [
          {
            path: 'home',
            element: <Home />
          },
          {
            path: 'about',
            element: <About />
          }
        ],
        {
          pathname: '/home',
          search: '',
          hash: ''
        }
      );
      let spy = jest.spyOn(router, 'replace');

      act(() => {
        ReactDOM.render(
          <Router router={router}>
            <RouterView />
          </Router>,
          node
        );
      });

      let button = node.querySelector('button');
      expect(button).not.toBeNull();

      act(() => {
        button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });

      expect(spy).toHaveBeenCalled();
    });
  });
});
