import { defineFile } from '../../..';
import { resolvePkgFile } from '../../../../../paths';

export default () =>
  defineFile({
    content: () =>
      `export { setPublicRuntimeConfig as default } from '${resolvePkgFile(
        'lib/shared/shuvi-singleton-runtimeConfig'
      )}'`
  });
