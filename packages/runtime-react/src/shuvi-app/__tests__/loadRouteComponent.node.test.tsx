import { loadRouteComponent } from '../loadRouteComponent';
import { act } from 'shuvi-test-utils/reactTestRender';
import FirstPage from './fixtures/loadRouteComponent/firstPage';
import { renderWithRoutes } from './utils';

const firstPageComponent = loadRouteComponent(() => {
  return import('./fixtures/loadRouteComponent/firstPage');
});

const secondPageComponent = loadRouteComponent(() => {
  return import('./fixtures/loadRouteComponent/secondPage');
});

describe('loadRouteComponent [node]', () => {
  const routes = [
    {
      id: 'secondPage',
      component: secondPageComponent,
      path: '/second'
    },
    {
      id: 'firstPage',
      component: firstPageComponent,
      path: '/first'
    }
  ];

  const initialProps = {
    firstPage: {
      test: '123'
    }
  };

  it('basic', async () => {
    const { root, toJSON } = renderWithRoutes(
      { routes, initialProps },
      { route: '/first' }
    );

    await act(async () => {});

    // Spread initialProps as props
    expect(root.findByType(FirstPage).props).toMatchObject({
      test: '123'
    });

    expect(toJSON()).toMatchInlineSnapshot(`
      <div>
        first page
      </div>
    `);

    // No getInitialProps
    const { toJSON: secondToJson } = renderWithRoutes(
      { routes, initialProps },
      {
        route: '/second'
      }
    );

    await act(async () => {});

    expect(secondToJson()).toMatchInlineSnapshot(`
      <div>
        second page
        <a
          href="/first"
          onClick={[Function]}
        >
          go first page
        </a>
      </div>
    `);
  });
});
