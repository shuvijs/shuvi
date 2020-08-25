/**
 * @jest-environment jsdom
 */

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import { MemoryRouter as Router, useNavigate, RouterView } from '..';

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

  describe('with an absolute href', () => {
    it('navigates to the correct URL', () => {
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

      act(() => {
        ReactDOM.render(
          <Router
            initialEntries={['/home']}
            routes={[
              {
                path: 'home',
                element: <Home />
              },
              {
                path: 'about',
                element: <About />
              }
            ]}
          >
            <RouterView />
          </Router>,
          node
        );
      });

      expect(node.innerHTML).toMatchInlineSnapshot(
        `"<div><h1>Home</h1><button>click me</button></div>"`
      );

      let button = node.querySelector('button');
      expect(button).not.toBeNull();

      act(() => {
        button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });

      expect(node.innerHTML).toMatchInlineSnapshot(`"<h1>About</h1>"`);
    });
  });

  describe('with a relative href', () => {
    it('navigates to the correct URL', () => {
      function Home() {
        let navigate = useNavigate();

        function handleClick() {
          navigate('../about');
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

      act(() => {
        ReactDOM.render(
          <Router
            initialEntries={['/home']}
            routes={[
              {
                path: 'home',
                element: <Home />
              },
              {
                path: 'about',
                element: <About />
              }
            ]}
          >
            <RouterView />
          </Router>,
          node
        );
      });

      expect(node.innerHTML).toMatchInlineSnapshot(
        `"<div><h1>Home</h1><button>click me</button></div>"`
      );

      let button = node.querySelector('button');
      expect(button).not.toBeNull();

      act(() => {
        button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });

      expect(node.innerHTML).toMatchInlineSnapshot(`"<h1>About</h1>"`);
    });
  });
});
