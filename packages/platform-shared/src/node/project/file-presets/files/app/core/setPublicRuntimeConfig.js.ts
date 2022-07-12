import { defineFile } from '../../..';
import { resolveToModulePath } from '../../../../../paths';

export default () =>
  defineFile({
    content: () =>
      `export { setPublicRuntimeConfig as default } from '${resolveToModulePath(
        'shared/shuvi-singleton-runtimeConfig'
      )}'`
  });
