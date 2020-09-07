import * as React from 'react';
import { create as createTestRenderer } from 'react-test-renderer';
import { MemoryRouter as Router, RouterView, useRouter } from '..';

describe('uesRouter', () => {
  it('returns the current router object', () => {
    let router;
    function Home() {
      router = useRouter();
      return <h1>Home</h1>;
    }

    createTestRenderer(
      <Router
        initialEntries={['/home?the=search#the-hash']}
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

    expect(typeof router).toBe('object');
    expect(router).toMatchObject(
      expect.objectContaining({
        current: expect.objectContaining({
          hash: '#the-hash',
          pathname: '/home',
          query: {
            the: 'search'
          },
          params: {},
          search: '?the=search'
        }),
        back: expect.any(Function),
        forward: expect.any(Function),
        go: expect.any(Function),
        push: expect.any(Function),
        replace: expect.any(Function),
        resolve: expect.any(Function),
        listen: expect.any(Function)
      })
    );
  });
});
