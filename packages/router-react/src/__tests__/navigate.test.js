/**
 * @jest-environment jsdom
 */

import * as React from 'react';
import { act } from 'react-dom/test-utils';
import { MemoryRouter as Router, useNavigate, RouterView } from '..';
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

  describe('with an absolute href', () => {
    it('navigates to the correct URL', () => {
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

      act(() => {
        createRoot(node).render(
          <Router
            initialEntries={['/home']}
            routes={[
              {
                path: 'home',
                component: Home
              },
              {
                path: 'about',
                component: About
              }
            ]}
          >
            <RouterView />
          </Router>
        );
      });

      expect(node.innerHTML).toMatchInlineSnapshot(
        `"<div><h1>Home</h1><button>click me</button></div>"`
      );

      let button = node.querySelector('button');
      expect(button).not.toBeNull();

      act(() => {
        button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });

      expect(node.innerHTML).toMatchInlineSnapshot(`"<h1>About</h1>"`);
    });
  });

  describe('with a relative href', () => {
    it('navigates to the correct URL', () => {
      function Home() {
        let navigate = useNavigate();

        function handleClick() {
          navigate('../about');
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

      act(() => {
        createRoot(node).render(
          <Router
            initialEntries={['/home']}
            routes={[
              {
                path: 'home',
                component: Home
              },
              {
                path: 'about',
                component: About
              }
            ]}
          >
            <RouterView />
          </Router>
        );
      });

      expect(node.innerHTML).toMatchInlineSnapshot(
        `"<div><h1>Home</h1><button>click me</button></div>"`
      );

      let button = node.querySelector('button');
      expect(button).not.toBeNull();

      act(() => {
        button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });

      expect(node.innerHTML).toMatchInlineSnapshot(`"<h1>About</h1>"`);
    });
  });
});
