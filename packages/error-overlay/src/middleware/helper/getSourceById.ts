import { promises as fs } from 'fs';
import { RawSourceMap } from 'source-map';
import dataUriToBuffer, { MimeBuffer } from 'data-uri-to-buffer';
import type webpack from '@shuvi/toolpack/lib/webpack';

import { getSourceMapUrl } from './getSourceMapUrl';
import { getModuleById } from './getModuleById';

export type Source = { map: () => RawSourceMap } | null;

async function getRawSourceMap(fileUrl: string): Promise<RawSourceMap | null> {
  //fetch sourcemap directly first
  const url = fileUrl + '.map';
  const sourceMapContent: string | null = await fs
    .readFile(url, 'utf-8')
    .catch(() => null);
  if (sourceMapContent !== null) {
    return sourceMapContent;
  }
  //fetch sourcemap by fileContent
  const fileContent: string | null = await fs
    .readFile(fileUrl, 'utf-8')
    .catch(() => null);

  if (fileContent == null) {
    return null;
  }

  const sourceUrl = getSourceMapUrl(fileContent);

  if (!sourceUrl?.startsWith('data:')) {
    const index = fileUrl.lastIndexOf('/');
    const urlFromFile = fileUrl.substring(0, index + 1) + sourceUrl;
    return await fs.readFile(urlFromFile, 'utf-8').catch(() => null);
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
    const map = await getRawSourceMap(id);

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
