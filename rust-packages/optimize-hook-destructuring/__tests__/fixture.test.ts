import { transform } from '@swc/core';
import * as path from 'path';
import { createFixtureTestSuite } from './helper/fixture-test-utils';

const swc = async (
  code: string,
  {
    reactPackage,
    hookPrefix
  }: { reactPackage?: string; hookPrefix?: string } = {}
) => {
  const options = {
    reactPackage: reactPackage || 'react',
    hookPrefix: hookPrefix || 'use'
  };

  const result = await transform(code, {
    jsc: {
      parser: {
        syntax: 'typescript',
        tsx: true
      },
      target: 'es2020',
      transform: {
        react: {
          runtime: 'automatic'
        },
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
          [
            path.join(
              __dirname,
              '../swc_plugin_optimize_hook_destructuring.wasm'
            ),
            options
          ]
        ]
      }
    }
  });

  return result.code;
};

describe('optimize-hook-destructuring fixtures', () => {
  const fixturesDir = path.join(
    __dirname,
    '../../../packages/compiler/src/swc/__tests__/plugins/fixtures/optimize-hook-destructuring'
  );

  createFixtureTestSuite(fixturesDir, {
    transform: swc,
    forceUpdateOutput: false
  });
});
