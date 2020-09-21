import { execSteps } from './utils';

export default (router, done) => {
  let hookWasCalled = false;
  let unblock;

  let steps = [
    ({ location }) => {
      expect(location).toMatchObject({
        pathname: '/'
      });

      router.push('/home');
    },
    ({ action, location }) => {
      expect(action).toBe('PUSH');
      expect(location).toMatchObject({
        pathname: '/home'
      });

      unblock = router.block(() => {
        hookWasCalled = true;
      });

      window.history.go(-1);
    },
    ({ action, location }) => {
      expect(action).toBe('POP');
      expect(location).toMatchObject({
        pathname: '/'
      });

      expect(hookWasCalled).toBe(true);

      unblock();
    }
  ];

  execSteps(steps, router, done);
};
