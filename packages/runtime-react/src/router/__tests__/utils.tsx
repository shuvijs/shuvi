import React from 'react';
import { createMemoryHistory, MemoryHistory } from 'history';
import { Router } from 'react-router-dom';
import { render } from 'shuvi-test-utils/reactTestRender';

// https://testing-library.com/docs/example-react-router#reducing-boilerplate
export const renderWithRouter = (
  ui: React.ReactElement,
  {
    route = '/',
    history = createMemoryHistory({ initialEntries: [route] }),
  }: { route?: string; history?: MemoryHistory } = {}
) => {
  const Wrapper: React.FC = ({ children }) => (
    <Router history={history}>{children}</Router>
  );
  return {
    ...render(<Wrapper>{ui}</Wrapper>),
    // adding `history` to the returned utilities to allow us
    // to reference it in our tests (just try to avoid using
    // this to test implementation details).
    history,
  };
};
