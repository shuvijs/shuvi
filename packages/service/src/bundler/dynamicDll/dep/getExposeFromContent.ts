import assert from 'assert';
import { readFileSync } from 'fs-extra';
import { basename } from 'path';
import { getModuleExports } from './getModuleExports';

export async function getExposeFromContent(libraryPath: string) {
  // Support CSS
  if (/\.(css|less|scss|sass|stylus|styl)$/.test(libraryPath)) {
    return `import '${libraryPath}';`;
  }

  // Support Assets Files
  if (
    /\.(json|svg|png|jpe?g|avif|gif|webp|ico|eot|woff|woff2|ttf|txt|text|mdx?)$/.test(
      libraryPath
    )
  ) {
    return `
import _ from '${libraryPath}';
export default _;`.trim();
  }

  assert(
    /(js|jsx|mjs|ts|tsx)$/.test(libraryPath),
    `file type not supported for ${basename(libraryPath)}.`
  );
  const content = readFileSync(libraryPath, 'utf-8');

  const { exports, isCJS } = await getModuleExports({
    content,
    libraryPath
  });
  // cjs
  if (isCJS) {
    return [
      `import _ from '${libraryPath}';`,
      `export default _;`,
      `export * from '${libraryPath}';`
    ].join('\n');
  }
  // esm
  else {
    const ret = [];
    let hasExports = false;
    if (exports.includes('default')) {
      ret.push(`import _ from '${libraryPath}';`);
      ret.push(`export default _;`);
      hasExports = true;
    }
    if (
      hasNonDefaultExports(exports) ||
      // export * from 不会有 exports，只会有 imports
      /export\s+\*\s+from/.test(content)
    ) {
      ret.push(`export * from '${libraryPath}';`);
      hasExports = true;
    }

    if (!hasExports) {
      // 只有 __esModule 的全量导出
      if (exports.includes('__esModule') && exports.length > 1) {
        ret.push(`import _ from '${libraryPath}';`);
        ret.push(`export default _;`);
        ret.push(`export * from '${libraryPath}';`);
      } else {
        ret.push(`import '${libraryPath}';`);
      }
    }

    return ret.join('\n');
  }
}

function hasNonDefaultExports(exports: any) {
  return (
    exports.filter((exp: string) => !['__esModule', 'default'].includes(exp))
      .length > 0
  );
}
