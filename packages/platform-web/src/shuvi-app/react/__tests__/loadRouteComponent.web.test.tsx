/**
 * @jest-environment jsdom
 */

import { loadRouteComponent } from '../loadRouteComponent';
import { act } from 'shuvi-test-utils/reactTestRender';
import FirstPage from './fixtures/loadRouteComponent/firstPage';
import DetailPage from './fixtures/loadRouteComponent/detailPage';
import { renderWithRoutes } from './utils';
import { wait } from 'shuvi-test-utils';

describe('loadRouteComponent [web]', () => {
  it('basic', async () => {
    const routeProps = {
      firstPage: {
        data: 'data from server'
      }
    };

    const { root, toJSON } = renderWithRoutes(
      {
        routes: [
          {
            id: 'firstPage',
            component: loadRouteComponent(
              () => import('./fixtures/loadRouteComponent/firstPage')
            ),
            path: '/first'
          }
        ],
        appContext: { routeProps }
      },
      { route: '/first' }
    );

    await act(async () => {
      await wait(1100);
    });

    // Spread routeProps as props
    expect(root.findByType(FirstPage).props).toMatchObject({
      data: 'data from server'
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
  });

  it('getInitialProps should work in client when the route component be activated', async () => {
    // No getInitialProps
    const { root, toJSON } = renderWithRoutes(
      {
        routes: [
          {
            id: 'firstPage',
            component: loadRouteComponent(
              () => import('./fixtures/loadRouteComponent/firstPage')
            ),
            path: '/first'
          },
          {
            id: 'secondPage',
            component: loadRouteComponent(
              () => import('./fixtures/loadRouteComponent/secondPage')
            ),
            path: '/second'
          }
        ]
      },
      {
        route: '/second'
      }
    );

    // await for lodable update state
    await act(async () => {});

    expect(toJSON()).toMatchInlineSnapshot(`
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

    await act(async () => {
      root.findByType('a').props.onClick(new MouseEvent('click'));
    });

    // wait for route resolve(getInitialProps)
    await act(async () => {
      await wait(1100);
    });

    // getInitialProps resolved
    expect(root.findByType(FirstPage).props).toMatchObject({
      data: 'done'
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
  });

  it('getInitialProps should not called when leave route', async () => {
    const getInitialProps = jest.spyOn(FirstPage, 'getInitialProps');
    const { root, toJSON } = renderWithRoutes(
      {
        routes: [
          {
            id: 'firstPage',
            component: loadRouteComponent(
              () => import('./fixtures/loadRouteComponent/firstPage')
            ),
            path: '/first'
          },
          {
            id: 'secondPage',
            component: loadRouteComponent(
              () => import('./fixtures/loadRouteComponent/secondPage')
            ),
            path: '/second'
          }
        ]
      },
      {
        route: '/first'
      }
    );

    // wait for route resolve(getInitialProps)
    await act(async () => {
      await wait(1100);
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
            component: loadRouteComponent(
              () => import('./fixtures/loadRouteComponent/detailPage')
            ),
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
      await wait(1100);
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

    // wait for route resolve(getInitialProps)
    await act(async () => {
      await wait(1100);
    });

    // getInitialProps resolved
    expect(root.findByType(DetailPage).props).toMatchObject({
      data: {
        id: '2'
      }
    });
  });
});
