import * as React from 'react';
import { create as createTestRenderer } from 'react-test-renderer';
import { MemoryRouter as Router, RouterView, useCurrentRoute } from '..';

describe('useCurrentRoute', () => {
  it('returns the current location object', () => {
    let route;
    function Home() {
      route = useCurrentRoute();
      return <h1>Home</h1>;
    }

    createTestRenderer(
      <Router
        initialEntries={['/en/home?the=search#the-hash']}
        routes={[
          {
            path: '/:lng/home',
            element: <Home />
          }
        ]}
      >
        <RouterView />
      </Router>
    );

    expect(typeof route).toBe('object');
    expect(route).toMatchObject({
      pathname: '/en/home',
      search: '?the=search',
      hash: '#the-hash',
      query: {
        the: 'search'
      },
      params: {
        lng: 'en'
      }
    });
  });
});
