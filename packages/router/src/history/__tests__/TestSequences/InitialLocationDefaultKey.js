import { execSteps } from './utils';

export default (router, done) => {
  let steps = [
    ({ location }) => {
      expect(location.key).toBe('default');
    }
  ];

  execSteps(steps, router, done);
};
