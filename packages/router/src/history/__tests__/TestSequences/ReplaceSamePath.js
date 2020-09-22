import { execSteps } from './utils';

export default (router, done) => {
  let prevLocation;

  let steps = [
    ({ location }) => {
      expect(location).toMatchObject({
        pathname: '/'
      });

      router.replace('/home');
    },
    ({ action, location }) => {
      expect(action).toBe('REPLACE');
      expect(location).toMatchObject({
        pathname: '/home'
      });

      prevLocation = location;

      router.replace('/home');
    },
    ({ action, location }) => {
      expect(action).toBe('REPLACE');
      expect(location).toMatchObject({
        pathname: '/home'
      });

      expect(location).not.toBe(prevLocation);
    }
  ];

  execSteps(steps, router, done);
};
