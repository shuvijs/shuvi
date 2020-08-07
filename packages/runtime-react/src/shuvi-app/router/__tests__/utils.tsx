import React from 'react';
import { Router, MemoryRouter } from '@shuvi/router-react';
import { render, ReactTestRenderer } from 'shuvi-test-utils/reactTestRender';
import { createMemoryHistory, MemoryHistory, History } from '@shuvi/router';

// https://testing-library.com/docs/example-react-router#reducing-boilerplate

export const renderWithRouter = (
  ui: React.ReactElement,
  { route = '/' }: { route?: string } = {}
): ReactTestRenderer => {
  const Wrapper: React.FC = ({ children }) => (
    <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
  );
  return {
    ...render(<Wrapper>{ui}</Wrapper>)
  };
};
