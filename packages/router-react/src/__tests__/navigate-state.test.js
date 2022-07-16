/**
 * @jest-environment jsdom
 */

import * as React from 'react';
import { act } from 'react-dom/test-utils';
import {
  MemoryRouter as Router,
  useNavigate,
  useCurrentRoute,
  RouterView
} from '..';
import { createRoot } from 'react-dom/client';

describe('navigate state', () => {
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
    it('does not use any state', () => {
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

      let route;
      function About() {
        route = useCurrentRoute();
        return <h1>About</h1>;
      }

      act(() => {
        createRoot(node).render(
          <Router
            initialEntries={['/home']}
            routes={[
              { path: 'home', component: Home },
              { path: 'about', component: About }
            ]}
          >
            <RouterView />
          </Router>
        );
      });

      let button = node.querySelector('button');
      expect(button).not.toBeNull();

      act(() => {
        button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });

      expect(route).toBeDefined();
      expect(route).toMatchObject({
        state: null
      });
    });
  });

  describe('with { state }', () => {
    it('sets state on the next location', () => {
      function Home() {
        let navigate = useNavigate();
        let state = { from: 'home' };

        function handleClick() {
          navigate('../about', { state });
        }

        return (
          <div>
            <h1>Home</h1>
            <button onClick={handleClick}>click me</button>
          </div>
        );
      }

      let route;
      function About() {
        route = useCurrentRoute();
        return <h1>About</h1>;
      }

      act(() => {
        createRoot(node).render(
          <Router
            initialEntries={['/home']}
            routes={[
              { path: 'home', component: Home },
              { path: 'about', component: About }
            ]}
          >
            <RouterView />
          </Router>
        );
      });

      let button = node.querySelector('button');
      expect(button).not.toBeNull();

      act(() => {
        button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });

      expect(route).toBeDefined();
      expect(route).toMatchObject({
        state: { from: 'home' }
      });
    });
  });
});
