import { execSteps } from './utils';

export default (router, done) => {
  let steps = [
    ({ location }) => {
      expect(location.key).toBeTruthy();
    }
  ];

  execSteps(steps, router, done);
};
