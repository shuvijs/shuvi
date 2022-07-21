import * as path from 'path';
import { resolvePath } from '@shuvi/router';

import { IContext, MultiStats } from '../types';

export default function getFilenameFromUrl(
  context: IContext,
  url: string
): string | undefined {
  const { stats, options } = context;
  const compilationClient = (stats as MultiStats).stats[0].compilation;
  const [outputPath, publicPath] = [
    compilationClient.getPath(compilationClient.outputOptions.path!),
    compilationClient.getPath(options.publicPath)
  ];
  const urlObject = resolvePath(url);
  const publicPathObject = resolvePath(publicPath);

  let filename;

  if (
    urlObject.pathname &&
    typeof publicPathObject.pathname === 'string' &&
    urlObject.pathname.startsWith(publicPathObject.pathname)
  ) {
    filename = outputPath;

    const pathname = urlObject.pathname.substring(
      publicPathObject.pathname.length
    );

    if (pathname) {
      filename = path.join(outputPath, pathname);
    }
  }

  return filename;
}
