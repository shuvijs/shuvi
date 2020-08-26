import * as React from 'react';
import { act, create as createTestRenderer } from 'react-test-renderer';
import { MemoryRouter as Router, RouterView } from '..';

describe('Descendant <Routes> splat matching', () => {
  describe('when the parent route path ends with /*', () => {
    it('works', () => {
      function ReactFundamentals() {
        return <h1>React Fundamentals</h1>;
      }

      function ReactCourses() {
        return (
          <div>
            <h1>React</h1>
            <RouterView />
          </div>
        );
      }

      function Courses() {
        return (
          <div>
            <h1>Courses</h1>
            <RouterView />
          </div>
        );
      }

      let renderer;
      act(() => {
        renderer = createTestRenderer(
          <Router
            initialEntries={['/courses/react/react-fundamentals']}
            routes={[
              {
                path: 'courses',
                element: <Courses />,
                children: [
                  {
                    path: 'react',
                    element: <ReactCourses />,
                    children: [
                      {
                        path: 'react-fundamentals',
                        element: <ReactFundamentals />
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

      expect(renderer.toJSON()).toMatchSnapshot();
    });
  });
});
