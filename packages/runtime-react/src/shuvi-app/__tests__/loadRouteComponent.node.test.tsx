import { loadRouteComponent } from '../loadRouteComponent';
import { act } from 'shuvi-test-utils/reactTestRender';
import FirstPage from './fixtures/loadRouteComponent/firstPage';
import { renderWithRoutes } from './utils';
import SecondPage from './fixtures/loadRouteComponent/secondPage';

const firstPageComponent = loadRouteComponent(() => {
  return import('./fixtures/loadRouteComponent/firstPage');
});

const secondPageComponent = loadRouteComponent(() => {
  return import('./fixtures/loadRouteComponent/secondPage');
});

describe.skip('loadRouteComponent [node]', () => {
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
    const { root: secondRoot, toJSON: secondToJson } = renderWithRoutes(
      { routes, initialProps },
      {
        route: '/second'
      }
    );

    await act(async () => {});

    // clear item that are not undefined, should only be left with RouteComponentProps
    expect(
      Object.entries(secondRoot.findByType(SecondPage).props)
        .filter(([_, value]) => value !== undefined)
        .map(([key]) => key)
    ).toMatchInlineSnapshot(`
      Array [
        "history",
        "location",
        "match",
        "children",
      ]
    `);

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
