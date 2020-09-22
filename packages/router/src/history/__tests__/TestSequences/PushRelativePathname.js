import { execSteps } from './utils';

export default (router, done) => {
  let steps = [
    ({ location }) => {
      expect(location).toMatchObject({
        pathname: '/'
      });

      router.push('/the/path?the=query#the-hash');
    },
    ({ action, location }) => {
      expect(action).toBe('PUSH');
      expect(location).toMatchObject({
        pathname: '/the/path',
        search: '?the=query',
        hash: '#the-hash'
      });

      router.push('../other/path?another=query#another-hash');
    },
    ({ action, location }) => {
      expect(action).toBe('PUSH');
      expect(location).toMatchObject({
        pathname: '/the/other/path',
        search: '?another=query',
        hash: '#another-hash'
      });
    }
  ];

  execSteps(steps, router, done);
};
