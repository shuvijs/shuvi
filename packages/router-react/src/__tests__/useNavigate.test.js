import * as React from 'react';
import { create as createTestRenderer } from 'react-test-renderer';
import { MemoryRouter as Router, RouterView, useNavigate } from '..';

describe('useNavigate', () => {
  it('returns the navigate function', () => {
    let navigate;
    function Home() {
      navigate = useNavigate();
      return null;
    }

    createTestRenderer(
      <Router
        initialEntries={['/home']}
        routes={[
          {
            path: '/home',
            element: <Home />
          }
        ]}
      >
        <RouterView />
      </Router>
    );

    expect(navigate).toBeInstanceOf(Function);
  });
});
