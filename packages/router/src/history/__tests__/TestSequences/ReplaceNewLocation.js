import { execSteps } from './utils';

export default (router, done) => {
  let steps = [
    ({ location }) => {
      expect(location).toMatchObject({
        pathname: '/'
      });

      router.replace('/home?the=query#the-hash');
    },
    ({ action, location }) => {
      expect(action).toBe('REPLACE');
      expect(location).toMatchObject({
        pathname: '/home',
        search: '?the=query',
        hash: '#the-hash',
        state: null,
        key: expect.any(String)
      });
    }
  ];

  execSteps(steps, router, done);
};
