import * as React from 'react';
import { create as createTestRenderer } from 'react-test-renderer';
import { createMemoryHistory } from 'history';
import { Router } from '..';
import { createRouter } from '@shuvi/router/lib/';

describe('A <Router>', () => {
  let consoleError;
  beforeEach(() => {
    consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleError.mockRestore();
  });

  it('throws if another <Router> is already in context', () => {
    let router = createRouter(createMemoryHistory());

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
