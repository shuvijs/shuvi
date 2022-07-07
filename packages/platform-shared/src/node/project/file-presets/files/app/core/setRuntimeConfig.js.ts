import { defineFile } from '../../..';
import * as path from 'path';

const runtimeConfigPath = path.resolve(
  __dirname,
  '../../../../../../runtime/runtimeConfig'
);
export default () =>
  defineFile({
    content: () =>
      `export { setRuntimeConfig as default } from '${runtimeConfigPath}'`
  });
