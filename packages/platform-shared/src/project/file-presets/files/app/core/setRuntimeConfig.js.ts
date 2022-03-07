import { createFileWithoutName } from '@shuvi/service/lib/project';
import path from 'path';

const runtimeConfigPath = path.resolve(
  __dirname,
  '../../../../../lib/runtimeConfig'
);
export default () =>
  createFileWithoutName({
    content: () =>
      `export { setRuntimeConfig as default } from '${runtimeConfigPath}'`
  });
