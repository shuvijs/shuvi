import { transform } from '@swc/core';
import * as path from 'path';
import { createFixtureTestSuite } from './helper/fixture-test-utils';

const swc = async (
  code: string,
  { cssModuleFlag }: { cssModuleFlag: string } = { cssModuleFlag: '' }
) => {
  const options = {
    cssModuleFlag
  };

  const result = await transform(code, {
    jsc: {
      parser: {
        syntax: 'typescript',
        tsx: false
      },
      target: 'es2020',
      transform: {
        optimizer: {
          simplify: false,
          globals: {
            vars: {},
            typeofs: {}
          }
        }
      },
      experimental: {
        plugins: [
          [path.join(__dirname, '../swc_plugin_auto_css_modules.wasm'), options]
        ]
      }
    }
  });

  return result.code;
};

describe('auto-css-modules fixtures', () => {
  const fixturesDir = path.join(
    __dirname,
    '../../../packages/compiler/src/swc/__tests__/plugins/fixtures/auto-css-modules'
  );

  createFixtureTestSuite(fixturesDir, {
    transform: swc,
    forceUpdateOutput: false
  });
});
