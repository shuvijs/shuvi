import { defineFile } from '../../..';
import { resolvePkgFile } from '../../../../../paths';
import { makeSureSuffix } from '@shuvi/utils/lib/platform';

export default () =>
  defineFile({
    content: () =>
      `export { setRuntimeConfig as default } from '${makeSureSuffix(
        resolvePkgFile('lib/shared/shuvi-singleton-runtimeConfig')
      )}'`
  });
