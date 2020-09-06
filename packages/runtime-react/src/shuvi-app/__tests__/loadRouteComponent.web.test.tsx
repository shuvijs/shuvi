/**
 * @jest-environment jsdom
 */

import { loadRouteComponent } from '../loadRouteComponent';
import { act } from 'shuvi-test-utils/reactTestRender';
import FirstPage from './fixtures/loadRouteComponent/firstPage';
import DetailPage from './fixtures/loadRouteComponent/detailPage';
import { renderWithRoutes } from './utils';
import { wait } from 'shuvi-test-utils';

const firstPageComponent = loadRouteComponent(() => {
  return import('./fixtures/loadRouteComponent/firstPage');
});

const secondPageComponent = loadRouteComponent(() => {
  return import('./fixtures/loadRouteComponent/secondPage');
});

const detailPageComponent = loadRouteComponent(() => {
  return import('./fixtures/loadRouteComponent/detailPage');
});

describe('loadRouteComponent [web]', () => {
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

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('getInitialProps should be called when isFirstRender is false', async () => {
    const getInitialProps = jest.spyOn(FirstPage, 'getInitialProps');

    const routeProps = {
      firstPage: {
        data: 'data from server'
      }
    };

    const appContext = {
      isFirstRender: false
    };

    const { root, toJSON } = renderWithRoutes(
      {
        routes,
        routeProps,
        appContext
      },
      {
        route: '/first'
      }
    );

    expect(toJSON()).toMatchInlineSnapshot(`null`);

    await act(async () => {
      await wait(600);
    });

    expect(getInitialProps).toBeCalledTimes(1);

    expect(root.findByType(FirstPage).props).toMatchObject({
      data: 'done'
    });
  });

  it('getInitialProps should be called when roteProps is not defined and isFirstRender is true', async () => {
    const getInitialProps = jest.spyOn(FirstPage, 'getInitialProps');

    const routeProps = {};

    const appContext = {
      isFirstRender: true
    };

    const { root, toJSON } = renderWithRoutes(
      {
        routes,
        routeProps,
        appContext
      },
      {
        route: '/first'
      }
    );

    expect(toJSON()).toMatchInlineSnapshot(`null`);

    await act(async () => {
      await wait(600);
    });

    expect(getInitialProps).toBeCalledTimes(1);

    expect(root.findByType(FirstPage).props).toMatchObject({
      data: 'done'
    });
  });

  it('getInitialProps should not be called when routeProps is supplied when isFirstRender is true', async () => {
    const getInitialProps = jest.spyOn(FirstPage, 'getInitialProps');

    const routeProps = {
      firstPage: {
        data: 'data from server'
      }
    };

    const appContext = {
      isFirstRender: true
    };

    const { root } = renderWithRoutes(
      {
        routes,
        routeProps,
        appContext
      },
      {
        route: '/first'
      }
    );

    expect(getInitialProps).toBeCalledTimes(0);

    expect(root.findByType(FirstPage).props).toMatchObject({
      data: 'data from server'
    });
  });

  it('getInitialProps should not called when leave route', async () => {
    const getInitialProps = jest.spyOn(FirstPage, 'getInitialProps');
    const { root, toJSON } = renderWithRoutes(
      { routes },
      {
        route: '/first'
      }
    );

    // wait getInitialprops resolve
    await act(async () => {
      await wait(600);
    });

    expect(toJSON()).toMatchInlineSnapshot(`
      <div>
        first page
        <a
          href="/second"
          onClick={[Function]}
        >
          go second page
        </a>
      </div>
    `);

    expect(getInitialProps.mock.calls.length).toBe(1);

    await act(async () => {
      root.findByType('a').props.onClick(new MouseEvent('click'));
    });

    expect(getInitialProps.mock.calls.length).toBe(1);
  });

  it('getInitialProps should be recall in client when the route component params update', async () => {
    // No getInitialProps
    const { root, toJSON } = renderWithRoutes(
      {
        routes: [
          {
            id: 'detailPage',
            component: detailPageComponent,
            path: '/detail/:id'
          }
        ]
      },
      {
        route: '/detail/1'
      }
    );

    // getInitialProps not resolved
    expect(toJSON()).toMatchInlineSnapshot(`null`);

    await act(async () => {
      await wait(600);
    });

    // getInitialProps resolved
    expect(root.findByType(DetailPage).props).toMatchObject({
      data: {
        id: '1'
      }
    });

    await act(async () => {
      root.findByType('a').props.onClick(new MouseEvent('click'));
    });

    await act(async () => {
      await wait(600);
    });

    // getInitialProps resolved
    expect(root.findByType(DetailPage).props).toMatchObject({
      data: {
        id: '2'
      }
    });
  });
});
