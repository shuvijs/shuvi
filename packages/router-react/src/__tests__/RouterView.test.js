/**
 * @jest-environment jsdom
 */
import * as React from 'react';
import { act } from 'react-dom/test-utils';
import { create as createTestRenderer, act as tAct } from 'react-test-renderer';
import { Router, MemoryRouter, RouterView } from '..';
import { createMockRouter } from './utils';
import { createRoot } from 'react-dom/client';

describe('RouterView', () => {
  let node;
  beforeEach(() => {
    node = document.createElement('div');
    document.body.appendChild(node);
  });

  afterEach(() => {
    document.body.removeChild(node);
    node = null;
  });

  it('renders the first route that matches the URL', () => {
    function Home() {
      return <h1>Home</h1>;
    }

    let renderer = createTestRenderer(
      <MemoryRouter
        initialEntries={['/']}
        routes={[{ path: '/', component: Home }]}
      >
        <RouterView />
      </MemoryRouter>
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
      <MemoryRouter
        initialEntries={['/home']}
        routes={[
          { path: '/home', component: Home },
          { path: '/home', component: Dashboard }
        ]}
      >
        <RouterView />
      </MemoryRouter>
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
      <MemoryRouter
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
      </MemoryRouter>
    );

    expect(renderer.toJSON()).toMatchSnapshot();
  });

  it('layout should not re-render when child routes updated', () => {
    function Layout() {
      return (
        <div>
          <h1>Layout</h1>
          <RouterView />
        </div>
      );
    }

    function Home() {
      return <h1 id="home">Home</h1>;
    }

    function About() {
      return <h1 id="about">About</h1>;
    }

    let router = createMockRouter(
      [
        {
          path: '/',
          component: Layout,
          children: [
            { path: 'home', component: Home },
            {
              path: 'about',
              component: About
            }
          ]
        }
      ],
      {
        pathname: '/home',
        search: '',
        hash: ''
      }
    );

    act(() => {
      createRoot(node).render(
        <Router router={router}>
          <RouterView />
        </Router>
      );
    });

    let homeEl = node.querySelector('#home');
    expect(homeEl).not.toBeNull();

    act(() => {
      router.push('/about');
    });

    let aboutEl = node.querySelector('#about');
    expect(aboutEl).not.toBeNull();
  });

  describe('when there is no child route', () => {
    it('returns null', () => {
      function Home() {
        return <RouterView />;
      }

      let renderer = createTestRenderer(
        <MemoryRouter
          initialEntries={['/home']}
          routes={[
            {
              path: '/home',
              component: Home
            }
          ]}
        >
          <RouterView />
        </MemoryRouter>
      );

      expect(renderer.toJSON()).toBeNull();
    });
  });

  describe('when there is a child route', () => {
    it('returns an element', () => {
      function Users() {
        return <RouterView />;
      }

      function Profile() {
        return <p>Profile</p>;
      }

      let renderer = createTestRenderer(
        <MemoryRouter
          initialEntries={['/users/profile']}
          routes={[
            {
              path: '/users',
              component: Users,
              children: [
                {
                  path: '/profile',
                  component: Profile
                }
              ]
            }
          ]}
        >
          <RouterView />
        </MemoryRouter>
      );

      expect(renderer.toJSON()).toMatchSnapshot();
    });
  });
});
