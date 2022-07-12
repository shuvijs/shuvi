import { defineFile } from '../../..';
import * as path from 'path';

const runtimeConfigPath = path.resolve(
  __dirname,
  '../../../../../../shared/runtimeConfig'
);
export default () =>
  defineFile({
    content: () =>
      `export { setPublicRuntimeConfig as default } from '${runtimeConfigPath}'`
  });
