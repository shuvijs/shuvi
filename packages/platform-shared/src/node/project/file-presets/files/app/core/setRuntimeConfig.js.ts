import { createFileWithoutName } from '@shuvi/service/lib/project';
import * as path from 'path';

const runtimeConfigPath = path.resolve(
  __dirname,
  '../../../../../../runtime/runtimeConfig'
);
export default () =>
  createFileWithoutName({
    content: () =>
      `export { setRuntimeConfig as default } from '${runtimeConfigPath}'`
  });
