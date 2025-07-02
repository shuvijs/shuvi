import { createFixtureTestSuite } from '../helper/fixture-test-utils';
import transform from '../swc-transform';
import path from 'path';

const swc = async (code: string, options: any = {}) => {
  const defaultOptions = {
    isPageFile: true,
    pagePickLoader: false,
    jsc: {
      target: 'es2021'
    }
  };

  const finalOptions = { ...defaultOptions, ...options };
  return transform(code, finalOptions)!;
};

describe('page shake exports fixtures', () => {
  const fixturesDir = path.join(__dirname, 'fixtures/page-shake-exports');

  createFixtureTestSuite(fixturesDir, {
    transform: swc,
    forceUpdateOutput: false
  });
});
