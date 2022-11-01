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

      let current = router.current;
      expect(current).toEqual(router.current);
      router.push('/about');
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
      router.beforeEach(beforeEachFn);
      router.afterEach(afterEachFn);

      let current = router.current;
      expect(current).toBe(router.current);
      router.push('/about');
      expect(current).not.toBe(router.current);
    });

    it('should abort when guard return false', () => {
      beforeEachFn = jest.fn().mockImplementation((to, from, next) => {
        expect(routeResolveFn).toBeCalledTimes(0);
        expect(afterEachFn).toBeCalledTimes(0);
        next(false);
      });

      router.beforeEach(beforeEachFn);
      router.afterEach(afterEachFn);

      let current = router.current;
      expect(current).toBe(router.current);
      router.push('/about');
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

      router.beforeEach(beforeEachFn);
      router.afterEach(afterEachFn);

      let current = router.current;
      expect(current).toBe(router.current);
      router.push('/about');
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

      router.beforeEach(beforeEachFn);
      router.afterEach(afterEachFn);

      let current = router.current;
      expect(current).toBe(router.current);
      router.push('/about');
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

      router.beforeEach(beforeEachFn);

      let current = router.current;
      expect(current).toBe(router.current);
      router.push('/about');

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

      router.beforeEach(beforeEachFn);

      let current = router.current;
      expect(current).toBe(router.current);
      router.push('/about');

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

      router.beforeEach(beforeEachFn);
      router.beforeResolve(beforeResolveFn);
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
