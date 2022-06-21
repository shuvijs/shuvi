/**
 * @jest-environment node
 */

import { loadRouteComponent } from '../loadRouteComponent';
import { act } from 'shuvi-test-utils/reactTestRender';
import FirstPage from './fixtures/loadRouteComponent/firstPage';
import { renderWithRoutes } from './utils';

jest.mock('@shuvi/app/files/page-loaders', () => ({}), { virtual: true });

const firstPageComponent = loadRouteComponent(() => {
  return import('./fixtures/loadRouteComponent/firstPage');
});

const secondPageComponent = loadRouteComponent(() => {
  return import('./fixtures/loadRouteComponent/secondPage');
});

describe('loadRouteComponent', () => {
  it('basic', async () => {
    const routes = [
      {
        id: 'secondPage',
        component: secondPageComponent,
        path: '/second'
      },
      {
        id: 'firstPage',
        component: firstPageComponent,
        path: '/first',
        props: {
          test: '123'
        }
      }
    ];
    const { root, toJSON } = renderWithRoutes({ routes }, { route: '/first' });
    // await for lodable update state
    await act(async () => {});

    // Spread routeProps as props
    expect(root.findByType(FirstPage).props).toMatchObject({
      test: '123'
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

    const { toJSON: secondToJson } = renderWithRoutes(
      { routes },
      {
        route: '/second'
      }
    );
    // await for lodable update state
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
