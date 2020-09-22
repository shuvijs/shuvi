import { execSteps } from './utils';

export default (router, done) => {
  let steps = [
    () => {
      // encoded string
      let pathname = '/view/%23abc';
      router.replace(pathname);
    },
    ({ location }) => {
      expect(location).toMatchObject({
        pathname: '/view/%23abc'
      });
      // encoded object
      let pathname = '/view/%23abc';
      router.replace({ pathname });
    },
    ({ location }) => {
      expect(location).toMatchObject({
        pathname: '/view/%23abc'
      });
      // unencoded string
      let pathname = '/view/#abc';
      router.replace(pathname);
    },
    ({ location }) => {
      expect(location).toMatchObject({
        pathname: '/view/',
        hash: '#abc'
      });
    }
  ];

  execSteps(steps, router, done);
};
