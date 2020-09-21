import { execSteps } from './utils';

export default (router, done) => {
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

      router.push('/home');
    },
    ({ action, location }) => {
      expect(action).toBe('PUSH');
      expect(location).toMatchObject({
        pathname: '/home'
      });

      router.back();
    },
    ({ action, location }) => {
      expect(action).toBe('POP');
      expect(location).toMatchObject({
        pathname: '/home'
      });
    }
  ];

  execSteps(steps, router, done);
};
