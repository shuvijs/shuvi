import { createFixtureTestSuite } from '../helper/fixture-test-utils';
import transform from '../swc-transform';
import path from 'path';

const swc = async (code: string, options: any = {}) => {
  return transform(code, options)!;
};

describe('optimize-hook-destructuring fixtures', () => {
  const fixturesDir = path.join(
    __dirname,
    'fixtures/optimize-hook-destructuring'
  );

  createFixtureTestSuite(fixturesDir, {
    transform: swc,
    forceUpdateOutput: false
  });
});
