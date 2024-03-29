/**
 * @jest-environment jsdom
 */

import * as React from 'react';
import { act } from 'react-dom/test-utils';
import { Router, useNavigate, RouterView } from '..';
import { createMockRouter } from './utils';
import { createRoot } from 'react-dom/client';

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
            component: Home
          },
          {
            path: 'about',
            component: About
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
        createRoot(node).render(
          <Router router={router}>
            <RouterView />
          </Router>
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
            component: Home
          },
          {
            path: 'about',
            component: About
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
        createRoot(node).render(
          <Router router={router}>
            <RouterView />
          </Router>
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
