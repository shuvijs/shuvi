/**
 * @jest-environment jsdom
 */

import * as React from 'react';
import { getByText, render, waitFor, cleanup } from '@testing-library/react';
import { wait } from 'shuvi-test-utils/shared';
import dynamic from '../dynamic';

describe('dynamic', () => {
  afterEach(cleanup);

  test('promise argument', async () => {
    const App = dynamic(async () => {
      await wait(100);
      return () => <h1>App</h1>;
    });
    const { container } = render(<App />);
    expect(container.innerHTML).toEqual('');

    await waitFor(() => {
      getByText(container, 'App');
      expect(container.innerHTML).toEqual('<h1>App</h1>');
    });
  });

  test('object argument', async () => {
    const App = dynamic({
      loader: async () => {
        await wait(100);
        return () => <h1>App</h1>;
      }
    });
    const { container } = render(<App />);
    expect(container.innerHTML).toEqual('');
    await waitFor(() => {
      getByText(container, 'App');
      expect(container.innerHTML).toEqual('<h1>App</h1>');
    });
  });

  test('custom loading', async () => {
    const App = dynamic(
      async () => {
        await wait(100);
        return () => <h1>App</h1>;
      },
      {
        loading: ({ isLoading }) => {
          if (isLoading) {
            return <p>loading...</p>;
          }

          return null;
        }
      }
    );
    const { container } = render(<App />);
    expect(container.innerHTML).toEqual('<p>loading...</p>');
    await waitFor(() => {
      getByText(container, 'App');
      expect(container.innerHTML).toEqual('<h1>App</h1>');
    });
  });
});
