import { defineFile } from '../../..';
import { resolveToModulePath } from '../../../../../paths';

export default () =>
  defineFile({
    content: () =>
      `export { setRuntimeConfig as default } from '${resolveToModulePath(
        'shared/shuvi-singleton-runtimeConfig'
      )}'`
  });
