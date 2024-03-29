import * as React from 'react';
import { create as createTestRenderer } from 'react-test-renderer';
import { createRouter, createMemoryHistory } from '@shuvi/router';
import { Router } from '..';

describe('A <Router>', () => {
  let consoleError;
  beforeEach(() => {
    consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleError.mockRestore();
  });

  it('throws if another <Router> is already in context', () => {
    let router = createRouter({
      routes: [],
      history: createMemoryHistory()
    }).init();

    expect(() => {
      createTestRenderer(
        <Router router={router}>
          <Router router={router} />
        </Router>
      );
    }).toThrow(/cannot render a <Router> inside another <Router>/);

    expect(consoleError).toHaveBeenCalled();
  });
});
