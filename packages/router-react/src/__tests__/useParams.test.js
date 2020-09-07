import * as React from 'react';
import { create as createTestRenderer } from 'react-test-renderer';
import { MemoryRouter as Router, RouterView, useParams } from '..';

describe('useParams', () => {
  describe("when the route isn't matched", () => {
    it('returns an empty object', () => {
      let params;
      function Home() {
        params = useParams();
        return null;
      }

      createTestRenderer(
        <Router initialEntries={['/home']}>
          <Home />
        </Router>
      );

      expect(typeof params).toBe('object');
      expect(Object.keys(params)).toHaveLength(0);
    });
  });

  describe('when the path has no params', () => {
    it('returns an empty object', () => {
      let params;
      function Home() {
        params = useParams();
        return null;
      }

      createTestRenderer(
        <Router
          initialEntries={['/home']}
          routes={[
            {
              path: '/home',
              component: Home
            }
          ]}
        >
          <RouterView />
        </Router>
      );

      expect(typeof params).toBe('object');
      expect(Object.keys(params)).toHaveLength(0);
    });
  });

  describe('when the path has some params', () => {
    it('returns an object of the URL params', () => {
      let params;
      function BlogPost() {
        params = useParams();
        return null;
      }

      createTestRenderer(
        <Router
          initialEntries={['/blog/shuvi-router']}
          routes={[
            {
              path: '/blog/:slug',
              component: BlogPost
            }
          ]}
        >
          <RouterView />
        </Router>
      );

      expect(typeof params).toBe('object');
      expect(params).toMatchObject({
        slug: 'shuvi-router'
      });
    });

    describe('a child route', () => {
      it('returns a combined hash of the parent and child params', () => {
        let params;

        function Course() {
          params = useParams();
          return null;
        }

        function UserDashboard() {
          return (
            <div>
              <h1>User Dashboard</h1>
              <RouterView />
            </div>
          );
        }

        createTestRenderer(
          <Router
            initialEntries={['/users/mjackson/courses/shuvi-router']}
            routes={[
              {
                path: 'users/:username',
                component: UserDashboard,
                children: [
                  {
                    path: 'courses/:course',
                    component: Course
                  }
                ]
              }
            ]}
          >
            <RouterView />
          </Router>
        );

        expect(typeof params).toBe('object');
        expect(params).toMatchObject({
          username: 'mjackson',
          course: 'shuvi-router'
        });
      });
    });
  });

  describe('when the path has percent-encoded params', () => {
    it('returns an object of the decoded params', () => {
      let params;
      function BlogPost() {
        params = useParams();
        return null;
      }

      createTestRenderer(
        <Router
          initialEntries={['/blog/react%20router']}
          routes={[
            {
              path: '/blog/:slug',
              component: BlogPost
            }
          ]}
        >
          <RouterView />
        </Router>
      );

      expect(typeof params).toBe('object');
      expect(params).toMatchObject({
        slug: 'react router'
      });
    });
  });

  describe('when the path has a + character', () => {
    it('returns an object of the decoded params', () => {
      let params;
      function BlogPost() {
        params = useParams();
        return null;
      }

      createTestRenderer(
        <Router
          initialEntries={['/blog/react+router+is%20awesome']}
          routes={[
            {
              path: '/blog/:slug',
              component: BlogPost
            }
          ]}
        >
          <RouterView />
        </Router>
      );

      expect(typeof params).toBe('object');
      expect(params).toMatchObject({
        slug: 'react router is awesome'
      });
    });
  });

  describe('when the path has a malformed param', () => {
    let consoleWarn;
    beforeEach(() => {
      consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleWarn.mockRestore();
    });

    it('returns the raw value and warns', () => {
      let params;
      function BlogPost() {
        params = useParams();
        return null;
      }

      createTestRenderer(
        <Router
          initialEntries={['/blog/react%2router']}
          routes={[
            {
              path: '/blog/:slug',
              component: BlogPost
            }
          ]}
        >
          <RouterView />
        </Router>
      );

      expect(typeof params).toBe('object');
      expect(params).toMatchObject({
        slug: 'react%2router'
      });

      expect(consoleWarn).toHaveBeenCalledWith(
        expect.stringMatching('malformed URL segment')
      );
    });
  });
});
