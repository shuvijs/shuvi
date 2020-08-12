/**
 * @jest-environment jsdom
 */

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import { Router, Routes, Route, useNavigate } from '..';
import { createRouter } from '@shuvi/router/src';

function createMockRouter(initialLocation) {
  return createRouter({
    action: 'POP',
    location: initialLocation,
    createHref() {},
    push() {},
    replace() {},
    go() {},
    back() {},
    forward() {},
    listen() {},
    block() {}
  });
}

describe('navigate', () => {
  let node;
  beforeEach(() => {
    node = document.createElement('div');
    document.body.appendChild(node);
  });

  afterEach(() => {
    document.body.removeChild(node);
    node = null;
  });

  describe('by default', () => {
    it('calls router.push()', () => {
      function Home() {
        let navigate = useNavigate();

        function handleClick() {
          navigate('/about');
        }

        return (
          <div>
            <h1>Home</h1>
            <button onClick={handleClick}>click me</button>
          </div>
        );
      }

      function About() {
        return <h1>About</h1>;
      }

      let router = createMockRouter({
        pathname: '/home',
        search: '',
        hash: ''
      });
      let spy = jest.spyOn(router, 'push');

      act(() => {
        ReactDOM.render(
          <Router router={router}>
            <Routes>
              <Route path="home" element={<Home />} />
              <Route path="about" element={<About />} />
            </Routes>
          </Router>,
          node
        );
      });

      let button = node.querySelector('button');
      expect(button).not.toBeNull();

      act(() => {
        button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('with { replace: true }', () => {
    it('calls router.replace()', () => {
      function Home() {
        let navigate = useNavigate();

        function handleClick() {
          navigate('/about', { replace: true });
        }

        return (
          <div>
            <h1>Home</h1>
            <button onClick={handleClick}>click me</button>
          </div>
        );
      }

      function About() {
        return <h1>About</h1>;
      }

      let router = createMockRouter({
        pathname: '/home',
        search: '',
        hash: ''
      });
      let spy = jest.spyOn(router, 'replace');

      act(() => {
        ReactDOM.render(
          <Router router={router}>
            <Routes>
              <Route path="home" element={<Home />} />
              <Route path="about" element={<About />} />
            </Routes>
          </Router>,
          node
        );
      });

      let button = node.querySelector('button');
      expect(button).not.toBeNull();

      act(() => {
        button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });

      expect(spy).toHaveBeenCalled();
    });
  });
});
