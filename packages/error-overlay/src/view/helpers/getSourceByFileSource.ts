import { RawSourceMap } from 'source-map';

import { getSourceMapUrl } from '../../shared/helper/getSourceMapUrl';

export type Source = RawSourceMap | null;

export async function getSourceByFileSource(
  fileUri: string,
  fileContents: string
): Promise<Source> {
  let sourceMapUrl = getSourceMapUrl(fileContents);

  if (sourceMapUrl.startsWith('data:')) {
    const base64 = /^data:application\/json;([\w=:"-]+;)*base64,/;
    const match2 = sourceMapUrl.match(base64);
    if (!match2) {
      throw new Error(
        'Sorry, non-base64 inline source-map encoding is not supported.'
      );
    }
    sourceMapUrl = sourceMapUrl.substring(match2[0].length);
    sourceMapUrl = window.atob(sourceMapUrl);
    return JSON.parse(sourceMapUrl);
  } else {
    const index = fileUri.lastIndexOf('/');
    const url = fileUri.substring(0, index + 1) + sourceMapUrl;
    const map = await fetch(url).then(res => res.json());
    return map;
  }
}
