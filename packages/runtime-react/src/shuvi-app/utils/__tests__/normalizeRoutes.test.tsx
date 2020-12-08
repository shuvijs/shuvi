/**
 * @jest-environment jsdom
 */

import * as React from 'react';
import { Runtime } from '@shuvi/types/';
import { RouterView } from '@shuvi/router-react';
import { renderRoutes } from './utils';
import { ReactTestRenderer, act } from 'react-test-renderer';
import { normalizeRoutes } from '../router';

import IAppRouteConfig = Runtime.IAppRouteConfig;
import { wait } from 'shuvi-test-utils';

const createDummyComponent = (text: string): React.FC => {
  const Comp = (props: any) => {
    return (
      <div>
        {text}
        <RouterView />
      </div>
    );
  };
  Comp.getInitialProps = () => ({});
  return Comp;
};

const getInitialProps = (
  app: ReactTestRenderer,
  component: React.ElementType
) => app.root.findByType(component).props;

const HOME_COMPONENT = createDummyComponent('home');
const ABOUT_COMPONENT = createDummyComponent('about');
const HI_COMPONENT = createDummyComponent('hi');
const TEST_COMPONENT = createDummyComponent('test');
const COOL_COMPONENT = createDummyComponent('cool');
const SHUVI_COMPONENT = createDummyComponent('shuvi');

const initialPropsHash = {
  '0001': {
    test: true,
    sample: 'asd'
  },
  '0002': {
    data: [1, 2, 3]
  },
  '0003': {
    data: {
      error: 'error'
    }
  },
  '0004': {
    id: '004'
  },
  '0005': {}
};

describe('normalizeRoutes', () => {
  it('basic', () => {
    const sampleRoutes: IAppRouteConfig[] = [
      {
        id: '0001',
        component: HOME_COMPONENT,
        path: '/'
      },
      {
        id: '0002',
        component: ABOUT_COMPONENT,
        path: '/about'
      }
    ];

    const routes = normalizeRoutes(sampleRoutes, {
      routeProps: initialPropsHash,
      appContext: {}
    })!;
    let json, app;

    // render / page
    app = renderRoutes(routes, {
      route: '/'
    });
    json = app.toJSON();

    expect(getInitialProps(app, HOME_COMPONENT)).toStrictEqual({
      sample: 'asd',
      test: true
    });

    expect(json).toMatchInlineSnapshot(`
      <div>
        home
      </div>
    `);

    // render /about page
    app = renderRoutes(routes, {
      route: '/about'
    });
    json = app.toJSON();

    expect(getInitialProps(app, ABOUT_COMPONENT)).toStrictEqual({
      data: [1, 2, 3]
    });

    expect(json).toMatchInlineSnapshot(`
      <div>
        about
      </div>
    `);
  });

  it('nested', async () => {
    const sampleRoutes: IAppRouteConfig[] = [
      {
        id: '0001',
        component: HOME_COMPONENT,
        path: '/'
      },
      {
        id: '0002',
        component: ABOUT_COMPONENT,
        path: '/about',
        children: [
          {
            id: '0003',
            component: HI_COMPONENT,
            path: 'hi'
          },
          {
            id: '0004',
            component: TEST_COMPONENT,
            path: 'test'
          }
        ]
      }
    ];

    let app, json;

    app = renderRoutes(
      normalizeRoutes(sampleRoutes, {
        routeProps: initialPropsHash,
        appContext: {}
      }),
      {
        route: '/about'
      }
    );

    // wait for router ready
    await act(async () => {
      wait(100);
    });

    json = app.toJSON();
    console.log('json', json);
    expect(getInitialProps(app, ABOUT_COMPONENT)).toStrictEqual({
      data: [1, 2, 3]
    });
    expect(json).toMatchInlineSnapshot(`
      <div>
        about
      </div>
    `);

    app = renderRoutes(
      normalizeRoutes(sampleRoutes, {
        routeProps: initialPropsHash,
        appContext: {}
      }),
      {
        route: '/about/hi'
      }
    );
    // wait for router ready
    await act(async () => {
      wait(100);
    });

    json = app.toJSON();

    // expect nested initialProps is passed
    expect(getInitialProps(app, ABOUT_COMPONENT)).toStrictEqual({
      data: [1, 2, 3]
    });
    expect(getInitialProps(app, HI_COMPONENT)).toStrictEqual({
      data: {
        error: 'error'
      }
    });
    expect(json).toMatchInlineSnapshot(`
      <div>
        about
        <div>
          hi
        </div>
      </div>
    `);

    app = renderRoutes(
      normalizeRoutes(sampleRoutes, {
        routeProps: initialPropsHash,
        appContext: {}
      }),
      {
        route: '/about/test'
      }
    );
    // wait for router ready
    await act(async () => {
      wait(100);
    });

    json = app.toJSON();

    expect(getInitialProps(app, ABOUT_COMPONENT)).toStrictEqual({
      data: [1, 2, 3]
    });
    expect(getInitialProps(app, TEST_COMPONENT)).toStrictEqual({
      id: '004'
    });

    expect(json).toMatchInlineSnapshot(`
      <div>
        about
        <div>
          test
        </div>
      </div>
    `);

    // fake route
    json = renderRoutes(
      normalizeRoutes(sampleRoutes, {
        routeProps: initialPropsHash,
        appContext: {}
      }),
      {
        route: '/fake'
      }
    ).toJSON();

    expect(json).toBeNull();
  });

  it('deep nested', () => {
    const sampleRoutes: IAppRouteConfig[] = [
      {
        id: '0001',
        component: HOME_COMPONENT,
        path: '/'
      },
      {
        id: '0002',
        component: ABOUT_COMPONENT,
        path: '/about',
        children: [
          {
            id: '0003',
            component: HI_COMPONENT,
            path: 'hi',
            children: [
              {
                id: '0004',
                component: COOL_COMPONENT,
                path: 'cool',
                children: [
                  {
                    id: '0005',
                    component: SHUVI_COMPONENT,
                    path: 'shuvi'
                  }
                ]
              }
            ]
          }
        ]
      }
    ];

    let app, json;

    app = renderRoutes(
      normalizeRoutes(sampleRoutes, {
        routeProps: initialPropsHash,
        appContext: {}
      }),
      {
        route: '/about/hi/cool/shuvi'
      }
    );
    json = app.toJSON();

    expect(getInitialProps(app, ABOUT_COMPONENT)).toStrictEqual({
      data: [1, 2, 3]
    });

    expect(getInitialProps(app, HI_COMPONENT)).toStrictEqual({
      data: {
        error: 'error'
      }
    });

    expect(getInitialProps(app, COOL_COMPONENT)).toStrictEqual({
      id: '004'
    });

    expect(getInitialProps(app, SHUVI_COMPONENT)).toStrictEqual({});

    expect(json).toMatchInlineSnapshot(`
      <div>
        about
        <div>
          hi
          <div>
            cool
            <div>
              shuvi
            </div>
          </div>
        </div>
      </div>
    `);
  });
});
