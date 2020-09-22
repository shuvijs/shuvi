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
      expect(action).toEqual('PUSH');
      expect(location).toMatchObject({
        pathname: '/home'
      });

      router.back();
    },
    ({ action, location }) => {
      expect(action).toEqual('POP');
      expect(location).toMatchObject({
        pathname: '/'
      });
    }
  ];

  execSteps(steps, router, done);
};
