import { create as createTestRenderer } from 'react-test-renderer';
import { MemoryRouter as Router, Routes, Route, RouterView } from '..';

describe('A <RouterView>', () => {
  it('renders the first route that matches the URL', () => {
    function Home() {
      return <h1>Home</h1>;
    }

    let renderer = createTestRenderer(
      <Router initialEntries={['/']} routes={[{ path: '/', component: Home }]}>
        <RouterView />
      </Router>
    );

    expect(renderer.toJSON()).toMatchSnapshot();
  });

  it('does not render a 2nd route that also matches the URL', () => {
    function Home() {
      return <h1>Home</h1>;
    }

    function Dashboard() {
      return <h1>Dashboard</h1>;
    }

    let renderer = createTestRenderer(
      <Router
        initialEntries={['/home']}
        routes={[
          { path: '/home', component: Home },
          { path: '/home', component: Dashboard }
        ]}
      >
        <RouterView />
      </Router>
    );

    expect(renderer.toJSON()).toMatchSnapshot();
  });

  it('renders with nested routes', () => {
    function Home() {
      return <h1>Home</h1>;
    }

    function Admin() {
      return (
        <>
          <h1>Admin</h1>
          <RouterView />
        </>
      );
    }

    function User() {
      return <h1>User</h1>;
    }

    let renderer = createTestRenderer(
      <Router
        initialEntries={['/admin/user']}
        routes={[
          { path: '/home', component: Home },
          {
            path: '/admin',
            component: Admin,
            children: [{ path: 'user', component: User }]
          }
        ]}
      >
        <RouterView />
      </Router>
    );

    expect(renderer.toJSON()).toMatchSnapshot();
  });
});
