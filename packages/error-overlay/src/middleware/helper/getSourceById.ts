import { promises as fs } from 'fs';
import { RawSourceMap } from 'source-map';
import dataUriToBuffer, { MimeBuffer } from 'data-uri-to-buffer';
import type webpack from '@shuvi/toolpack/lib/webpack';

import { getSourceMapUrl } from './getSourceMapUrl';
import { getModuleById } from './getModuleById';

export type Source = { map: () => RawSourceMap } | null;

function getRawSourceMap(fileContents: string): RawSourceMap | null {
  const sourceUrl = getSourceMapUrl(fileContents);
  if (!sourceUrl?.startsWith('data:')) {
    return null;
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
  compilation?: webpack.Compilation
): Promise<Source> {
  if (isFile) {
    const fileContent: string | null = await fs
      .readFile(id, 'utf-8')
      .catch(() => null);

    if (fileContent == null) {
      return null;
    }

    const map = getRawSourceMap(fileContent);
    if (map == null) {
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
    return (
      (module &&
        (compilation as any).codeGenerationResults
          .get(module)
          ?.sources.get('javascript')) ??
      null
    );
  } catch (err) {
    console.error(`Failed to lookup module by ID ("${id}"):`, err);
    return null;
  }
}
