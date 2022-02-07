import path from 'path';
import { loader } from 'webpack';
import { transform, browserslistToTargets } from '@parcel/css';

const parcelCssLoader: loader.Loader = function (inputSource: Buffer | string) {
  console.log(inputSource.toString());
  console.log(Object.prototype.toString.call(inputSource));
  const res = transform({
    filename: '',
    code:
      inputSource instanceof Buffer ? inputSource : Buffer.from(inputSource),
    cssModules: true,
    analyzeDependencies: true,
    sourceMap: false,
    drafts: {
      nesting: true
      // customMedia: true,
    },
    pseudoClasses: {},
    targets: {
      safari: 4 << 16,
      firefox: (3 << 16) | (5 << 8),
      opera: (10 << 16) | (5 << 8)
    }
  });
  console.log(res, 111);
  const code = res.code.toString();
  console.log(code, 'code');
  return code;
};
export default parcelCssLoader;
// accept Buffers instead of strings
export const raw = true;
