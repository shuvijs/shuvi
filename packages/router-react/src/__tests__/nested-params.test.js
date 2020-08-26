import * as React from 'react';
import { create as createTestRenderer } from 'react-test-renderer';
import { MemoryRouter as Router, useParams, RouterView } from '..';

describe('nested routes', () => {
  it('gets all params from parent routes', () => {
    function Users() {
      return (
        <div>
          <h1>Users</h1>
          <RouterView />
        </div>
      );
    }

    function User() {
      let { username } = useParams();
      return (
        <div>
          <h1>User: {username}</h1>
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

    function Course() {
      // We should be able to access the username param here
      // even though it was defined in a parent route from
      // another set of <Routes>
      let { username, courseId } = useParams();
      return (
        <div>
          <h1>
            User: {username}, course {courseId}
          </h1>
        </div>
      );
    }

    let renderer = createTestRenderer(
      <Router
        initialEntries={['/users/michael/courses/routing']}
        routes={[
          {
            path: 'users',
            element: <Users />,
            children: [
              {
                path: ':username',
                element: <User />,
                children: [
                  {
                    path: 'courses',
                    element: <Courses />,
                    children: [
                      {
                        path: ':courseId',
                        element: <Course />
                      }
                    ]
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

    expect(renderer.toJSON()).not.toBeNull();
    expect(renderer.toJSON()).toMatchSnapshot();
  });
});
