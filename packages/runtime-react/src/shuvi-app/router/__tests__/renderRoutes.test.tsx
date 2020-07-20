/**
 * @jest-environment jsdom
 */

import React from 'react';
import renderRoutes from '../renderRoutes';
import { IRoute } from '@shuvi/types/src/runtime';
import { renderWithRouter } from './utils';
import { ReactTestRenderer } from 'react-test-renderer';

const createDummyComponent = (text: string): React.FC => ({ children }) => (
  <div>
    {text}
    {children}
  </div>
);

const getInitialProps = (
  app: ReactTestRenderer,
  component: React.ElementType
) => app.root.findByType(component).props.__initialProps;

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
  '0005': {}
};

describe('renderRoutes', () => {
  it('return null for empty routes', () => {
    const routes = renderRoutes([]);
    expect(routes).toBeNull();
  });

  it('basic', () => {
    const sampleRoutes: IRoute[] = [
      {
        id: '0001',
        component: HOME_COMPONENT,
        exact: true,
        path: '/'
      },
      {
        id: '0002',
        component: ABOUT_COMPONENT,
        path: '/about',
        exact: true
      }
    ];

    const routesComponent = renderRoutes(sampleRoutes, {
      initialProps: initialPropsHash
    })!;
    let json, app;

    // render / page
    app = renderWithRouter(routesComponent, {
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
    app = renderWithRouter(routesComponent, {
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

  it('nested', () => {
    const sampleRoutes: IRoute[] = [
      {
        id: '0001',
        component: HOME_COMPONENT,
        exact: true,
        path: '/'
      },
      {
        id: '0002',
        component: ABOUT_COMPONENT,
        path: '/about',
        exact: false,
        routes: [
          {
            id: '0003',
            exact: true,
            component: HI_COMPONENT,
            path: '/about/hi'
          },
          {
            id: '0004',
            exact: true,
            component: TEST_COMPONENT,
            path: '/about/test'
          }
        ]
      }
    ];

    const routesComponent = renderRoutes(sampleRoutes, {
      initialProps: initialPropsHash
    })!;
    let app, json;

    app = renderWithRouter(routesComponent, {
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

    app = renderWithRouter(routesComponent, {
      route: '/about/hi'
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

    app = renderWithRouter(routesComponent, {
      route: '/about/test'
    });
    json = app.toJSON();

    expect(getInitialProps(app, TEST_COMPONENT)).toBeUndefined();

    expect(json).toMatchInlineSnapshot(`
      <div>
        about
        <div>
          test
        </div>
      </div>
    `);

    // fake route
    json = renderWithRouter(routesComponent, {
      route: '/fake'
    }).toJSON();

    expect(json).toBeNull();
  });

  it('deep nested', () => {
    const sampleRoutes: IRoute[] = [
      {
        id: '0001',
        component: HOME_COMPONENT,
        exact: true,
        path: '/'
      },
      {
        id: '0002',
        component: ABOUT_COMPONENT,
        path: '/about',
        exact: false,
        routes: [
          {
            id: '0003',
            exact: false,
            component: HI_COMPONENT,
            path: '/about/hi',
            routes: [
              {
                id: '0004',
                exact: false,
                component: COOL_COMPONENT,
                path: '/about/hi/cool',
                routes: [
                  {
                    id: '0005',
                    exact: false,
                    component: SHUVI_COMPONENT,
                    path: '/about/hi/cool/shuvi'
                  }
                ]
              }
            ]
          }
        ]
      }
    ];

    const routesComponent = renderRoutes(sampleRoutes, {
      initialProps: initialPropsHash
    })!;
    let app, json;

    app = renderWithRouter(routesComponent, {
      route: '/about/hi/cool/shuvi'
    });
    json = app.toJSON();

    expect(getInitialProps(app, ABOUT_COMPONENT)).toStrictEqual({
      data: [1, 2, 3]
    });

    expect(getInitialProps(app, HI_COMPONENT)).toStrictEqual({
      data: {
        error: 'error'
      }
    });

    expect(getInitialProps(app, COOL_COMPONENT)).toBeUndefined();

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
