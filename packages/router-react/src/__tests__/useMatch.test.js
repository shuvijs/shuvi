import * as React from 'react';
import { create as createTestRenderer } from 'react-test-renderer';
import { MemoryRouter as Router, RouterView, useMatch } from '..';

describe('useMatch', () => {
  describe('when the path matches the current URL', () => {
    it('returns the match', () => {
      let match;
      function Layout() {
        match = useMatch('home');
        return null;
      }

      function Home() {
        return <h1>Home</h1>;
      }

      function About() {
        return <h1>About</h1>;
      }

      createTestRenderer(
        <Router
          initialEntries={['/home']}
          routes={[
            {
              path: '/',
              element: <Layout />,
              children: [
                {
                  path: '/home',
                  element: <Home />
                },
                {
                  path: '/about',
                  element: <About />
                }
              ]
            }
          ]}
        >
          <RouterView />
        </Router>
      );

      expect(match).toMatchObject({
        path: 'home',
        pathname: '/home',
        params: {}
      });
    });
  });

  describe('when the path does not match the current URL', () => {
    it('returns null', () => {
      let match;
      function Layout() {
        match = useMatch('about');
        return null;
      }

      function Home() {
        return <h1>Home</h1>;
      }

      function About() {
        return <h1>About</h1>;
      }

      createTestRenderer(
        <Router
          initialEntries={['/home']}
          routes={[
            {
              path: '/',
              element: <Layout />,
              children: [
                {
                  path: '/home',
                  element: <Home />
                },
                {
                  path: '/about',
                  element: <About />
                }
              ]
            }
          ]}
        >
          <RouterView />
        </Router>
      );

      expect(match).toBe(null);
    });
  });
});
