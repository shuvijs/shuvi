import { createFixtureTestSuite } from '../helper/fixture-test-utils';
import transform from '../swc-transform';
import path from 'path';

const swc = async (
  code: string,
  { cssModuleFlag }: { cssModuleFlag: string } = { cssModuleFlag: '' }
) => {
  const options = {
    cssModuleFlag
  };

  return transform(code, options)!;
};

describe('auto-css-modules fixtures', () => {
  const fixturesDir = path.join(__dirname, 'fixtures/auto-css-modules');

  createFixtureTestSuite(fixturesDir, {
    transform: swc,
    forceUpdateOutput: false
  });
});
