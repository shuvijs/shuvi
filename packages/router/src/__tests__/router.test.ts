import { MemoryHistory } from '../history';
import { createRouter } from '../router';
import { IRouter } from '../types';

describe('router', () => {
  describe('current', () => {
    it('should not change until history changes', () => {
      const router = createRouter({
        routes: [{ path: '/' }, { path: '/about' }],
        history: new MemoryHistory({
          initialEntries: ['/', '/about'],
          initialIndex: 0
        })
      });

      const { push, current } = router;
      expect(current).toEqual(router.current);
      push('/about');
      expect(current).not.toEqual(router.current);
    });
  });

  describe('redirect', () => {
    it('should have the correct current redirect', () => {
      const router = createRouter({
        routes: [
          { path: '/' },
          {
            path: 'about',
            redirect: '/',
            children: [
              {
                path: 'redirect',
                redirect: '/about'
              }
            ]
          }
        ],
        history: new MemoryHistory({
          initialEntries: ['/about/redirect'],
          initialIndex: 0
        })
      }).init();

      let current = router.current;
      expect(current.redirected).toBe(true);
      expect(current.pathname).toBe('/');
    });

    describe('single redirect in route config', () => {
      it('should use replace when route config redirects at initial navigation', () => {
        const history = new MemoryHistory();
        jest.spyOn(history, 'replace');
        jest.spyOn(history, 'push');
        const router = createRouter({
          routes: [{ path: '/', redirect: '/c' }, { path: '/c' }],
          history
        }).init();

        let current = router.current;

        expect(current.redirected).toBe(true);
        expect(history.location.redirectedFrom).toMatchObject({
          pathname: '/'
        });
        expect(history.replace).toBeCalledTimes(1);
        expect(history.replace).toBeCalledWith('/c', expect.anything());
        expect(history.push).toBeCalledTimes(0);
        expect(current.pathname).toBe('/c');
      });

      it('should use push when route config redirects at push navigation', () => {
        const history = new MemoryHistory();
        jest.spyOn(history, 'replace');
        jest.spyOn(history, 'push');
        const router = createRouter({
          routes: [
            { path: '/' },
            { path: '/b', redirect: '/c' },
            { path: '/c' }
          ],
          history
        }).init();

        router.push('/b');

        let current = router.current;

        expect(current.redirected).toBe(true);
        expect(history.location.redirectedFrom).toMatchObject({
          pathname: '/b'
        });
        expect(history.replace).toBeCalledTimes(0);
        expect(history.push).toBeCalledTimes(2);
        expect(history.push).toHaveBeenNthCalledWith(
          1,
          '/b',
          expect.anything()
        );
        expect(history.push).toHaveBeenNthCalledWith(
          2,
          '/c',
          expect.anything()
        );

        expect(current.pathname).toBe('/c');

        router.back();
        expect(router.current.pathname).toBe('/');
      });

      it('should use replace when route config redirects at replace navigation', () => {
        const history = new MemoryHistory();

        const router = createRouter({
          routes: [
            { path: '/' },
            { path: '/a' },
            { path: '/b', redirect: '/c' },
            { path: '/c' }
          ],
          history
        }).init();

        router.push('/a');

        jest.spyOn(history, 'replace');
        jest.spyOn(history, 'push');
        router.replace('/b');

        let current = router.current;

        expect(current.redirected).toBe(true);
        expect(history.location.redirectedFrom).toMatchObject({
          pathname: '/b'
        });
        expect(history.replace).toBeCalledTimes(2);
        expect(history.replace).toHaveBeenNthCalledWith(
          1,
          '/b',
          expect.anything()
        );
        expect(history.replace).toHaveBeenNthCalledWith(
          2,
          '/c',
          expect.anything()
        );

        expect(history.push).toBeCalledTimes(0);
        expect(current.pathname).toBe('/c');

        router.back();
        expect(router.current.pathname).toBe('/');
      });
    });

    describe('multiple redirect in route config', () => {
      it('should use replace when route config redirects for multiple times at initial navigation', () => {
        const history = new MemoryHistory();
        jest.spyOn(history, 'replace');
        jest.spyOn(history, 'push');
        const router = createRouter({
          routes: [
            { path: '/', redirect: '/b' },
            { path: '/b', redirect: '/c' },
            { path: '/c' }
          ],
          history
        }).init();

        let current = router.current;

        expect(current.redirected).toBe(true);
        expect(history.location.redirectedFrom).toMatchObject({
          pathname: '/'
        });
        expect(history.replace).toBeCalledTimes(2);
        expect(history.replace).toHaveBeenNthCalledWith(
          1,
          '/b',
          expect.anything()
        );
        expect(history.replace).toHaveBeenNthCalledWith(
          2,
          '/c',
          expect.anything()
        );
        expect(history.push).toBeCalledTimes(0);
        expect(current.pathname).toBe('/c');
      });

      it('should use push when route config redirects for multiple times at push navigation', () => {
        const history = new MemoryHistory();
        jest.spyOn(history, 'replace');
        jest.spyOn(history, 'push');
        const router = createRouter({
          routes: [
            { path: '/' },
            { path: '/a', redirect: '/b' },
            { path: '/b', redirect: '/c' },
            { path: '/c' }
          ],
          history
        }).init();

        router.push('/a');

        let current = router.current;

        expect(current.redirected).toBe(true);
        expect(history.location.redirectedFrom).toMatchObject({
          pathname: '/a'
        });
        expect(history.replace).toBeCalledTimes(0);
        expect(history.push).toBeCalledTimes(3);
        expect(history.push).toHaveBeenNthCalledWith(
          1,
          '/a',
          expect.anything()
        );
        expect(history.push).toHaveBeenNthCalledWith(
          2,
          '/b',
          expect.anything()
        );
        expect(history.push).toHaveBeenNthCalledWith(
          3,
          '/c',
          expect.anything()
        );

        expect(current.pathname).toBe('/c');

        router.back();
        expect(router.current.pathname).toBe('/');
      });

      it('should use replace when route config redirects for multiple times at replace navigation', () => {
        const history = new MemoryHistory();

        const router = createRouter({
          routes: [
            { path: '/' },
            { path: '/a' },
            { path: '/b', redirect: '/c' },
            { path: '/c', redirect: '/d' }
          ],
          history
        }).init();

        router.push('/a');

        jest.spyOn(history, 'replace');
        jest.spyOn(history, 'push');
        router.replace('/b');

        let current = router.current;

        expect(current.redirected).toBe(true);
        expect(history.location.redirectedFrom).toMatchObject({
          pathname: '/b'
        });
        expect(history.replace).toBeCalledTimes(3);
        expect(history.replace).toHaveBeenNthCalledWith(
          1,
          '/b',
          expect.anything()
        );
        expect(history.replace).toHaveBeenNthCalledWith(
          2,
          '/c',
          expect.anything()
        );
        expect(history.replace).toHaveBeenNthCalledWith(
          3,
          '/d',
          expect.anything()
        );

        expect(history.push).toBeCalledTimes(0);
        expect(current.pathname).toBe('/d');

        router.back();
        expect(router.current.pathname).toBe('/');
      });
    });

    describe('single redirect in guards', () => {
      it('should use replace when a guard redirects at initial navigation', () => {
        const history = new MemoryHistory();
        jest.spyOn(history, 'replace');
        jest.spyOn(history, 'push');
        const router = createRouter({
          routes: [],
          history
        });

        router.beforeEach((to, _from, next) => {
          if (to.pathname === '/') {
            return next('/c');
          }
          next();
        });

        router.init();

        let current = router.current;
        expect(history.location.redirectedFrom).toMatchObject({
          pathname: '/'
        });
        expect(current.redirected).toBe(true);
        expect(history.replace).toBeCalledTimes(1);
        expect(history.replace).toBeCalledWith('/c', expect.anything());

        expect(history.push).toBeCalledTimes(0);
        expect(current.pathname).toBe('/c');
      });

      it('should use push when a guard redirects at push navigation', () => {
        const history = new MemoryHistory();
        jest.spyOn(history, 'replace');
        jest.spyOn(history, 'push');
        const router = createRouter({
          routes: [],
          history
        });

        router.beforeEach((to, _from, next) => {
          if (to.pathname === '/b') {
            return next('/c');
          }
          next();
        });

        router.init();

        router.push('/b');

        let current = router.current;
        expect(history.location.redirectedFrom).toMatchObject({
          pathname: '/b'
        });
        expect(current.redirected).toBe(true);
        expect(history.replace).toBeCalledTimes(0);
        expect(history.push).toBeCalledTimes(2);
        expect(history.push).toHaveBeenNthCalledWith(
          1,
          '/b',
          expect.anything()
        );
        expect(history.push).toHaveBeenNthCalledWith(
          2,
          '/c',
          expect.anything()
        );
        expect(current.pathname).toBe('/c');

        router.back();
        expect(router.current.pathname).toBe('/');
      });

      it('should use replace when a guard redirects with replace option at push navigation', () => {
        const history = new MemoryHistory();

        const router = createRouter({
          routes: [],
          history
        });
        router.beforeEach((to, _from, next) => {
          if (to.pathname === '/b') {
            return next({
              path: '/c',
              replace: true
            });
          }
          next();
        });
        router.init();

        router.push('/a');

        jest.spyOn(history, 'replace');
        jest.spyOn(history, 'push');

        router.push('/b');

        let current = router.current;
        expect(history.location.redirectedFrom).toMatchObject({
          pathname: '/b'
        });
        expect(current.redirected).toBe(true);
        expect(history.push).toBeCalledTimes(1);
        expect(history.push).toBeCalledWith('/b', expect.anything());
        expect(history.replace).toBeCalledTimes(1);
        expect(history.replace).toBeCalledWith('/c', expect.anything());
        expect(current.pathname).toBe('/c');

        router.back();
        expect(router.current.pathname).toBe('/');
      });

      it('should use replace when a guard redirects at replace navigation', () => {
        const history = new MemoryHistory();
        const router = createRouter({
          routes: [],
          history
        });

        router.beforeEach((to, _from, next) => {
          if (to.pathname === '/b') {
            return next('/c');
          }
          next();
        });
        router.init();

        router.push('/a');

        jest.spyOn(history, 'replace');
        jest.spyOn(history, 'push');
        router.replace('/b');

        let current = router.current;
        expect(history.location.redirectedFrom).toMatchObject({
          pathname: '/b'
        });
        expect(current.redirected).toBe(true);
        expect(history.replace).toBeCalledTimes(2);
        expect(history.replace).toHaveBeenNthCalledWith(
          1,
          '/b',
          expect.anything()
        );
        expect(history.replace).toHaveBeenNthCalledWith(
          2,
          '/c',
          expect.anything()
        );
        expect(history.push).toBeCalledTimes(0);
        expect(current.pathname).toBe('/c');

        router.back();
        expect(router.current.pathname).toBe('/');
      });
    });

    describe('multiple redirects in guards', () => {
      it('should use replace when guards redirect for multiple times at initial navigation', () => {
        const history = new MemoryHistory();
        jest.spyOn(history, 'replace');
        jest.spyOn(history, 'push');
        const router = createRouter({
          routes: [],
          history
        });

        router.beforeEach((to, _from, next) => {
          if (to.pathname === '/') {
            return next('/b');
          }
          if (to.pathname === '/b') {
            return next('/c');
          }
          next();
        });

        router.init();

        let current = router.current;
        // keep the original redirectedFrom
        expect(history.location.redirectedFrom).toMatchObject({
          pathname: '/'
        });
        expect(current.redirected).toBe(true);
        expect(history.replace).toBeCalledTimes(2);
        expect(history.replace).toHaveBeenNthCalledWith(
          1,
          '/b',
          expect.anything()
        );
        expect(history.replace).toHaveBeenNthCalledWith(
          2,
          '/c',
          expect.anything()
        );

        expect(history.push).toBeCalledTimes(0);
        expect(current.pathname).toBe('/c');
      });

      it('should use push when guards redirect for multiple times at push navigation', () => {
        const history = new MemoryHistory();
        jest.spyOn(history, 'replace');
        jest.spyOn(history, 'push');
        const router = createRouter({
          routes: [],
          history
        });

        router.beforeEach((to, _from, next) => {
          if (to.pathname === '/a') {
            return next('/b');
          }
          if (to.pathname === '/b') {
            return next('/c');
          }
          next();
        });

        router.init();

        router.push('/a');

        let current = router.current;
        // keep the original redirectedFrom
        expect(history.location.redirectedFrom).toMatchObject({
          pathname: '/a'
        });
        expect(current.redirected).toBe(true);
        expect(history.replace).toBeCalledTimes(0);
        expect(history.push).toBeCalledTimes(3);
        expect(history.push).toHaveBeenNthCalledWith(
          1,
          '/a',
          expect.anything()
        );
        expect(history.push).toHaveBeenNthCalledWith(
          2,
          '/b',
          expect.anything()
        );
        expect(history.push).toHaveBeenNthCalledWith(
          3,
          '/c',
          expect.anything()
        );
        expect(current.pathname).toBe('/c');

        router.back();
        expect(router.current.pathname).toBe('/');
      });

      it('should use replace when guards redirect with replace option for multiple times at push navigation', () => {
        const history = new MemoryHistory();

        const router = createRouter({
          routes: [],
          history
        });
        router.beforeEach((to, _from, next) => {
          if (to.pathname === '/b') {
            return next('/c');
          }
          /**
           * during the redirect c -> d, the redirect method changes to `replace`
           */
          if (to.pathname === '/c') {
            return next({
              path: '/d',
              replace: true
            });
          }

          /**
           * the redirect method has been changed to `replace`
           */
          if (to.pathname === '/d') {
            return next('/e');
          }
          next();
        });
        router.init();

        router.push('/a');

        jest.spyOn(history, 'replace');
        jest.spyOn(history, 'push');

        router.push('/b');

        let current = router.current;
        expect(history.location.redirectedFrom).toMatchObject({
          pathname: '/b'
        });
        expect(current.redirected).toBe(true);
        expect(history.push).toBeCalledTimes(2);
        expect(history.push).toHaveBeenNthCalledWith(
          1,
          '/b',
          expect.anything()
        );
        expect(history.push).toHaveBeenNthCalledWith(
          2,
          '/c',
          expect.anything()
        );
        expect(history.replace).toBeCalledTimes(2);
        /**
         * the redirect method has been changed to replace since the redirect c -> d
         */
        expect(history.replace).toHaveBeenNthCalledWith(
          1,
          '/d',
          expect.anything()
        );
        expect(history.replace).toHaveBeenNthCalledWith(
          2,
          '/e',
          expect.anything()
        );
        expect(current.pathname).toBe('/e');

        router.back();
        expect(router.current.pathname).toBe('/');
      });

      it('should use replace when guards redirect for multiple times at replace navigation', () => {
        const history = new MemoryHistory();
        const router = createRouter({
          routes: [],
          history
        });

        router.beforeEach((to, _from, next) => {
          if (to.pathname === '/b') {
            return next('/c');
          }
          if (to.pathname === '/c') {
            return next('/d');
          }
          next();
        });
        router.init();

        router.push('/a');

        jest.spyOn(history, 'replace');
        jest.spyOn(history, 'push');
        router.replace('/b');

        let current = router.current;
        expect(history.location.redirectedFrom).toMatchObject({
          pathname: '/b'
        });
        expect(current.redirected).toBe(true);
        expect(history.replace).toBeCalledTimes(3);
        expect(history.replace).toHaveBeenNthCalledWith(
          1,
          '/b',
          expect.anything()
        );
        expect(history.replace).toHaveBeenNthCalledWith(
          2,
          '/c',
          expect.anything()
        );
        expect(history.replace).toHaveBeenNthCalledWith(
          3,
          '/d',
          expect.anything()
        );
        expect(history.push).toBeCalledTimes(0);
        expect(current.pathname).toBe('/d');

        router.back();
        expect(router.current.pathname).toBe('/');
      });
    });

    describe('redirect in both guards and route config', () => {
      it('should use replace when route config and guards redirect at initial navigation', () => {
        const history = new MemoryHistory();
        jest.spyOn(history, 'replace');
        jest.spyOn(history, 'push');
        const router = createRouter({
          routes: [
            { path: '/', redirect: '/b' },
            { path: '/b' },
            { path: '/c' }
          ],
          history
        });

        router.beforeEach((to, _from, next) => {
          if (to.pathname === '/b') {
            return next('/c');
          }
          next();
        });

        router.init();

        let current = router.current;

        expect(current.redirected).toBe(true);
        expect(history.location.redirectedFrom).toMatchObject({
          pathname: '/'
        });
        expect(history.replace).toBeCalledTimes(2);
        expect(history.replace).toHaveBeenNthCalledWith(
          1,
          '/b',
          expect.anything()
        );
        expect(history.replace).toHaveBeenNthCalledWith(
          2,
          '/c',
          expect.anything()
        );
        expect(history.push).toBeCalledTimes(0);
        expect(current.pathname).toBe('/c');
      });

      it('should use push when route config and guards redirect at push navigation', () => {
        const history = new MemoryHistory();
        jest.spyOn(history, 'replace');
        jest.spyOn(history, 'push');
        const router = createRouter({
          routes: [
            { path: '/' },
            { path: '/a', redirect: '/b' },
            { path: '/b' },
            { path: '/c', redirect: '/d' }
          ],
          history
        });
        router.beforeEach((to, _from, next) => {
          if (to.pathname === '/b') {
            return next('/c');
          }
          next();
        });

        router.init();

        router.push('/a');

        let current = router.current;

        expect(current.redirected).toBe(true);
        expect(history.location.redirectedFrom).toMatchObject({
          pathname: '/a'
        });
        expect(history.replace).toBeCalledTimes(0);
        expect(history.push).toBeCalledTimes(4);
        expect(history.push).toHaveBeenNthCalledWith(
          1,
          '/a',
          expect.anything()
        );
        expect(history.push).toHaveBeenNthCalledWith(
          2,
          '/b',
          expect.anything()
        );
        expect(history.push).toHaveBeenNthCalledWith(
          3,
          '/c',
          expect.anything()
        );
        expect(history.push).toHaveBeenNthCalledWith(
          4,
          '/d',
          expect.anything()
        );

        expect(current.pathname).toBe('/d');

        router.back();
        expect(router.current.pathname).toBe('/');
      });

      it('should use replace when route config and guards redirect with replace option for multiple times at push navigation', () => {
        const history = new MemoryHistory();

        const router = createRouter({
          routes: [
            { path: '/' },
            { path: '/a' },
            { path: '/b', redirect: '/c' },
            { path: '/c' },
            { path: '/d', redirect: '/e' },
            { path: '/e' }
          ],
          history
        });
        router.beforeEach((to, _from, next) => {
          /**
           * during the redirect c -> d, the redirect method changes to `replace`
           */
          if (to.pathname === '/c') {
            return next({
              path: '/d',
              replace: true
            });
          }
          next();
        });
        router.init();

        router.push('/a');

        jest.spyOn(history, 'replace');
        jest.spyOn(history, 'push');

        router.push('/b');

        let current = router.current;
        expect(history.location.redirectedFrom).toMatchObject({
          pathname: '/b'
        });
        expect(current.redirected).toBe(true);
        expect(history.push).toBeCalledTimes(2);
        expect(history.push).toHaveBeenNthCalledWith(
          1,
          '/b',
          expect.anything()
        );
        expect(history.push).toHaveBeenNthCalledWith(
          2,
          '/c',
          expect.anything()
        );
        expect(history.replace).toBeCalledTimes(2);
        /**
         * the redirect method has been changed to replace since the redirect c -> d
         */
        expect(history.replace).toHaveBeenNthCalledWith(
          1,
          '/d',
          expect.anything()
        );
        expect(history.replace).toHaveBeenNthCalledWith(
          2,
          '/e',
          expect.anything()
        );
        expect(current.pathname).toBe('/e');

        router.back();
        expect(router.current.pathname).toBe('/');
      });

      it('should use replace when route config and guards redirect at replace navigation', () => {
        const history = new MemoryHistory();

        const router = createRouter({
          routes: [
            { path: '/' },
            { path: '/a' },
            { path: '/b' },
            { path: '/c', redirect: '/d' }
          ],
          history
        });

        router.beforeEach((to, _from, next) => {
          if (to.pathname === '/b') {
            return next('/c');
          }
          if (to.pathname === '/d') {
            return next('/e');
          }
          next();
        });

        router.init();

        router.push('/a');

        jest.spyOn(history, 'replace');
        jest.spyOn(history, 'push');
        router.replace('/b');

        let current = router.current;

        expect(current.redirected).toBe(true);
        expect(history.location.redirectedFrom).toMatchObject({
          pathname: '/b'
        });
        expect(history.replace).toBeCalledTimes(4);
        expect(history.replace).toHaveBeenNthCalledWith(
          1,
          '/b',
          expect.anything()
        );
        expect(history.replace).toHaveBeenNthCalledWith(
          2,
          '/c',
          expect.anything()
        );
        expect(history.replace).toHaveBeenNthCalledWith(
          3,
          '/d',
          expect.anything()
        );
        expect(history.replace).toHaveBeenNthCalledWith(
          4,
          '/e',
          expect.anything()
        );

        expect(history.push).toBeCalledTimes(0);
        expect(current.pathname).toBe('/e');

        router.back();
        expect(router.current.pathname).toBe('/');
      });
    });
  });

  describe('navigation flow', () => {
    let router: IRouter;
    let beforeEachFn: any, afterEachFn: any, routeResolveFn: any;

    beforeEach(() => {
      beforeEachFn = jest.fn().mockImplementation((to, from, next) => {
        expect(afterEachFn).toBeCalledTimes(0);
        expect(routeResolveFn).toBeCalledTimes(0);
        next();
      });

      routeResolveFn = jest.fn().mockImplementation((to, from, next) => {
        expect(to.pathname).toBe('/about');
        expect(from.pathname).toBe('/');
        expect(beforeEachFn).toBeCalledTimes(1);
        expect(afterEachFn).toBeCalledTimes(0);
        next();
      });

      afterEachFn = jest.fn().mockImplementation((to, from, next) => {
        expect(to.pathname).toBe('/about');
        expect(from.pathname).toBe('/');
        expect(beforeEachFn).toBeCalledTimes(1);
        expect(routeResolveFn).toBeCalledTimes(1);
        expect(next).toBeUndefined();
      });

      router = createRouter({
        routes: [
          { path: '/' },
          { path: '/about', resolve: routeResolveFn },
          { path: '/new' },
          { path: '/redirectToNew', redirect: '/new' }
        ],
        history: new MemoryHistory({
          initialEntries: ['/', '/about'],
          initialIndex: 0
        })
      }).init();
    });

    it('should run the navigation flow in sequence', () => {
      const { push } = router;

      let current = router.current;
      expect(current).toBe(router.current);
      push('/about');
      expect(current).not.toBe(router.current);
    });

    it('should abort when guard return false', () => {
      beforeEachFn = jest.fn().mockImplementation((to, from, next) => {
        expect(routeResolveFn).toBeCalledTimes(0);
        expect(afterEachFn).toBeCalledTimes(0);
        next(false);
      });

      const { push, beforeEach, afterEach } = router;

      beforeEach(beforeEachFn);
      afterEach(afterEachFn);

      let current = router.current;
      expect(current).toBe(router.current);
      push('/about');
      // route not changed because aborted
      expect(current).toBe(router.current);

      expect(beforeEachFn).toBeCalledTimes(1);
      [routeResolveFn, afterEachFn].forEach(fn =>
        expect(fn).toBeCalledTimes(0)
      );
    });

    it('should abort when guard return Error', () => {
      beforeEachFn = jest.fn().mockImplementation((to, from, next) => {
        expect(routeResolveFn).toBeCalledTimes(0);
        expect(afterEachFn).toBeCalledTimes(0);
        next(new Error());
      });

      const { push, beforeEach, afterEach } = router;

      beforeEach(beforeEachFn);
      afterEach(afterEachFn);

      let current = router.current;
      expect(current).toBe(router.current);
      push('/about');
      // route not changed because aborted
      expect(current).toBe(router.current);

      expect(beforeEachFn).toBeCalledTimes(1);
      expect(afterEachFn).toBeCalledTimes(0);
    });

    it('should abort when guard throw error', () => {
      beforeEachFn = jest.fn().mockImplementation((to, from, next) => {
        expect(routeResolveFn).toBeCalledTimes(0);
        expect(afterEachFn).toBeCalledTimes(0);
        throw new Error('test error');
      });

      const { push, beforeEach, afterEach } = router;

      beforeEach(beforeEachFn);
      afterEach(afterEachFn);

      let current = router.current;
      expect(current).toBe(router.current);
      push('/about');
      // route not changed because aborted
      expect(current).toBe(router.current);

      expect(beforeEachFn).toBeCalledTimes(1);
      expect(afterEachFn).toBeCalledTimes(0);
    });

    it('should change route when guard specify a url', () => {
      beforeEachFn = jest.fn().mockImplementation((to, from, next) => {
        if (to.pathname !== '/new') {
          next('/new');
        } else {
          next();
        }
      });

      const { push, beforeEach } = router;

      beforeEach(beforeEachFn);

      let current = router.current;
      expect(current).toBe(router.current);
      push('/about');

      // route not changed because aborted
      expect(router.current.pathname).toBe('/new');

      expect(beforeEachFn).toBeCalledTimes(2); // it trigger push 2 times
    });

    it('should change route when guard specify an object path', () => {
      beforeEachFn = jest.fn().mockImplementation((to, from, next) => {
        if (to.pathname !== '/new') {
          next({ path: '/new' });
        } else {
          next();
        }
      });

      const { push, beforeEach } = router;

      beforeEach(beforeEachFn);

      let current = router.current;
      expect(current).toBe(router.current);
      push('/about');

      // route not changed because aborted
      expect(router.current.pathname).toBe('/new');

      expect(beforeEachFn).toBeCalledTimes(2); // it trigger push 2 times
    });

    it('should replace route when route.redirect is specified', () => {
      let current = router.current;
      expect(current).toBe(router.current);
      router.push('/redirectToNew');

      expect(router.current.pathname).toBe('/new');
    });

    it('should not call guards when push with skipGuards', () => {
      const beforeEachFn = jest.fn().mockImplementation((to, from, next) => {
        next();
      });
      const beforeResolveFn = jest.fn().mockImplementation((to, from, next) => {
        next();
      });

      const { beforeEach, beforeResolve } = router;

      beforeEach(beforeEachFn);
      beforeResolve(beforeResolveFn);
      let current = router.current;
      expect(current).toBe(router.current);
      ((router as any)._history as MemoryHistory).push('/about', {
        skipGuards: true
      });
      expect(router.current.pathname).toBe('/about');
      expect(beforeEachFn).toBeCalledTimes(0);
      expect(beforeResolveFn).toBeCalledTimes(0);
    });
    it('should handle redirect well', () => {});
  });
});
