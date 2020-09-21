import { execSteps } from './utils';

export default (router, done) => {
  let steps = [
    ({ location }) => {
      expect(location).toMatchObject({
        pathname: '/'
      });

      let unblock = router.block();

      router.push('/home');

      expect(router.current).toMatchObject({
        pathname: '/'
      });

      unblock();
    }
  ];

  execSteps(steps, router, done);
};
