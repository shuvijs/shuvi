import { createFileWithoutName } from '@shuvi/service/lib/project';

export default () =>
  createFileWithoutName({
    content: () =>
      `export { setRuntimeConfig as default } from '@shuvi/platform-shared/lib/lib/runtimeConfig'`
  });
