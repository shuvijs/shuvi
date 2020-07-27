import * as React from 'react';
import { create as createTestRenderer } from 'react-test-renderer';
import { MemoryRouter as Router, Routes, Route, useRouter } from '..';

describe('uesRouter', () => {
  it('returns the current router object', () => {
    let router;
    function Home() {
      router = useRouter();
      return <h1>Home</h1>;
    }

    createTestRenderer(
      <Router initialEntries={['/home?the=search#the-hash']}>
        <Routes>
          <Route path="/home" element={<Home />} />
        </Routes>
      </Router>
    );

    expect(typeof router).toBe('object');
    expect(router).toMatchObject({
      back: expect.any(Function),
      forward: expect.any(Function),
      go: expect.any(Function),
      location: expect.objectContaining({
        hash: "#the-hash",
        pathname: "/home",
        query:{
          the:"search"
        },
        search: "?the=search"
      }),
      onChange: expect.any(Function),
      push: expect.any(Function),
      query:{
        the:"search"
      },
      replace: expect.any(Function)
    });
  });
});
