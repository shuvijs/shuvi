import { RawSourceMap } from 'source-map';
import dataUriToBuffer, { MimeBuffer } from 'data-uri-to-buffer';
import * as path from 'path';
import * as Rspack from '@shuvi/toolpack/lib/webpack';

import { getSourceMapUrl } from './getSourceMapUrl';
import { getModuleById } from './getModuleById';

export type Source = { map: () => RawSourceMap } | null;

const readFileWrapper = (
  url: string,
  compiler: Rspack.Compiler
): Promise<string | null> => {
  return new Promise(resolve => {
    /**
     * Both Webpack and Rspack use the same outputFileSystem API pattern.
     */
    if (!compiler.outputFileSystem) {
      resolve(null);
      return;
    }

    compiler.outputFileSystem.readFile(url, (err: any, res: any) => {
      if (err) {
        resolve(null);
      }
      resolve(res?.toString());
    });
  });
};

async function getRawSourceMap(
  fileUrl: string,
  compiler: Rspack.Compiler
): Promise<RawSourceMap | null> {
  //fetch sourcemap directly first
  const url = fileUrl + '.map';
  let sourceMapContent: string | null = null;

  sourceMapContent = await readFileWrapper(url, compiler);

  if (sourceMapContent !== null) {
    return sourceMapContent;
  }
  //fetch sourcemap by fileContent
  const fileContent = await readFileWrapper(fileUrl, compiler);

  if (fileContent == null) {
    return null;
  }

  const sourceUrl = getSourceMapUrl(fileContent);

  if (!sourceUrl) {
    return null;
  }

  if (!sourceUrl?.startsWith('data:')) {
    const index = fileUrl.lastIndexOf('/');
    const urlFromFile = fileUrl.substring(0, index + 1) + sourceUrl;
    return await readFileWrapper(urlFromFile, compiler);
  }

  let buffer: MimeBuffer;
  try {
    buffer = dataUriToBuffer(sourceUrl);
  } catch (err) {
    console.error('Failed to parse source map URL:', err);
    return null;
  }

  if (buffer.type !== 'application/json') {
    console.error(`Unknown source map type: ${buffer.typeFull}.`);
    return null;
  }

  try {
    return JSON.parse(buffer.toString());
  } catch {
    console.error('Failed to parse source map.');
    return null;
  }
}

export async function getSourceById(
  isFile: boolean,
  id: string,
  compiler: Rspack.Compiler,
  resolveBuildFile: (...paths: string[]) => string,
  buildDir: string,
  compilation?: Rspack.Compilation
): Promise<Source> {
  if (isFile) {
    const pathName: string = path.isAbsolute(id)
      ? id
      : resolveBuildFile(buildDir, id);

    const map = await getRawSourceMap(pathName, compiler);

    if (map === null) {
      return null;
    }
    return {
      map() {
        return map;
      }
    };
  }

  try {
    if (!compilation) {
      return null;
    }

    const module = getModuleById(id, compilation);

    /**
     * Try to get source from codeGenerationResults API.
     * Handle potential differences between Webpack and Rspack gracefully.
     */
    if (module) {
      try {
        // Try the standard codeGenerationResults API
        const codeGenResults = (compilation as any).codeGenerationResults;
        if (codeGenResults) {
          const moduleResults = codeGenResults.get(module);
          const source = moduleResults?.sources?.get('javascript');
          if (source) {
            return source;
          }
        }

        // Fallback: try alternative source extraction methods
        // This handles cases where Rspack might use different internal structures
        if ((module as any)._source) {
          return (module as any)._source;
        }
      } catch (e) {
        console.warn(
          'Failed to extract source using codeGenerationResults, trying fallback methods'
        );
      }
    }

    return null;
  } catch (err) {
    console.error(`Failed to lookup module by ID ("${id}"):`, err);
    return null;
  }
}
