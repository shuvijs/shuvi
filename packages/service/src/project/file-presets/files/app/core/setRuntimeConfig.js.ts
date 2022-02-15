import { createFileWithoutName } from '../../../..';

export default createFileWithoutName({
  content: () =>
    `export { setRuntimeConfig as default } from '@shuvi/service/lib/lib/runtimeConfig'`
});
