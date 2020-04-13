/**
 * @jest-environment jsdom
 */

import React from 'react';
import {
  getByText,
  render,
  waitFor,
  cleanup,
  act,
} from '@testing-library/react';
import { delay } from 'test-utils';
import dynamic from '../dynamic';

afterEach(cleanup);

describe('dynamic', () => {
  test('promise argument', async () => {
    // Normally we don't need wrap the whole test.
    // We can't control the update occured in dynamic interrnal,
    // so wrapped the whole test in act
    act(async () => {
      const App = dynamic(async () => {
        await delay(100);
        return () => <h1>App</h1>;
      });
      const { container } = render(<App />);
      expect(container.innerHTML).toEqual('');
      await waitFor(() => getByText(container, 'App'));
      expect(container.innerHTML).toEqual('<h1>App</h1>');
    });
  });

  test('object argument', async () => {
    act(async () => {
      const App = dynamic({
        loader: async () => {
          await delay(100);
          return () => <h1>App</h1>;
        },
      });
      const { container } = render(<App />);
      expect(container.innerHTML).toEqual('');
      await waitFor(() => getByText(container, 'App'));
      expect(container.innerHTML).toEqual('<h1>App</h1>');
    });
  });

  test('custom loading', async () => {
    act(async () => {
      const App = dynamic(
        async () => {
          await delay(100);
          return () => <h1>App</h1>;
        },
        {
          loading: ({ isLoading }) => {
            if (isLoading) {
              return <p>loading...</p>;
            }

            return null;
          },
        }
      );
      const { container } = render(<App />);
      expect(container.innerHTML).toEqual('<p>loading...</p>');
      await waitFor(() => getByText(container, 'App'));
      expect(container.innerHTML).toEqual('<h1>App</h1>');
    });
  });
});
