import * as React from 'react';
import { create as createTestRenderer } from 'react-test-renderer';
import { MemoryRouter as Router, RouterView, useParams } from '..';

describe('<Routes> with a basename', () => {
  function User() {
    let { userId } = useParams();
    return (
      <div>
        <h1>User: {userId}</h1>
        <RouterView />
      </div>
    );
  }

  function Dashboard() {
    return <h1>Dashboard</h1>;
  }

  let userRoutes = [
    {
      path: 'users/:userId',
      element: <User />,
      children: [
        {
          path: 'dashboard',
          element: <Dashboard />
        }
      ]
    }
  ];

  it('does not match when the URL pathname does not start with that base', () => {
    let renderer = createTestRenderer(
      <Router
        basename="/base"
        initialEntries={['/app/users/michael/dashboard']}
        routes={userRoutes}
      >
        <RouterView />
      </Router>
    );

    expect(renderer.toJSON()).toBeNull();
  });

  it('matches when the URL pathname starts with that base', () => {
    let renderer = createTestRenderer(
      <Router
        basename="/app"
        initialEntries={['/app/users/michael/dashboard']}
        routes={userRoutes}
      >
        <RouterView />
      </Router>
    );

    expect(renderer.toJSON()).not.toBeNull();
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <div>
        <h1>
          User: 
          michael
        </h1>
        <h1>
          Dashboard
        </h1>
      </div>
    `);
  });
});
