import { createFixtureTestSuite } from '../helper/fixture-test-utils';
import transform from '../swc-transform';
import path from 'path';

const swc = async (code: string, options: any = {}) => {
  return transform(code, options)!;
};

describe('transform fixtures', () => {
  const fixturesDir = path.join(__dirname, 'fixtures/transform');

  createFixtureTestSuite(fixturesDir, {
    transform: swc,
    forceUpdateOutput: false
  });
});
