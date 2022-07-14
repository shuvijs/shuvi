// @ts-ignore: es-module-lexer misconfigure its package.exports
import { init, parse } from 'es-module-lexer';
import { transform } from 'esbuild';
import { extname } from 'path';
import { getCJSExports } from './getCJSExports';

export async function getModuleExports({
  content,
  libraryPath
}: {
  libraryPath: string;
  content: string;
}) {
  // Support tsx and jsx
  if (/\.(tsx|jsx)$/.test(libraryPath)) {
    content = (
      await transform(content, {
        sourcemap: false,
        sourcefile: libraryPath,
        format: 'esm',
        target: 'es6',
        loader: extname(libraryPath).slice(1) as 'tsx' | 'jsx'
      })
    ).code;
  }

  await init;
  const [imports, exports] = parse(content);
  let isCJS = !imports.length && !exports.length;

  let cjsEsmExports = null;
  if (isCJS) {
    cjsEsmExports = getCJSExports({ content });
    if (cjsEsmExports.includes('__esModule')) {
      isCJS = false;
    }
  }
  return {
    exports: cjsEsmExports || exports,
    isCJS
  };
}
