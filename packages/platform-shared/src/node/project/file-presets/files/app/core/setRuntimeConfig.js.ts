import { defineFile } from '../../..';
import { resolvePkgFile } from '../../../../../paths';

export default () =>
  defineFile({
    content: () =>
      `export { setRuntimeConfig as default } from '${resolvePkgFile(
        'lib/shared/shuvi-singleton-runtimeConfig'
      )}'`
  });
