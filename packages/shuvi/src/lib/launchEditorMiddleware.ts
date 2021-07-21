import launchEditor from 'launch-editor';
import { IRequestHandlerWithNext } from '../server';

function getSourcePath(source: string) {
  // Webpack prefixes certain source paths with this path
  if (source.startsWith('webpack:///')) {
    return source.substring(11);
  }

  // Make sure library name is filtered out as well
  if (source.startsWith('webpack://_N_E/')) {
    return source.substring(15);
  }

  if (source.startsWith('webpack://')) {
    return source.substring(10);
  }

  if (source.startsWith('/')) {
    return source.substring(1);
  }

  return source;
}

export function createLaunchEditorMiddleware(
  launchEditorEndpoint: string
): IRequestHandlerWithNext {
  return function launchEditorMiddleware(req, res, next) {
    if (req.url.startsWith(launchEditorEndpoint)) {
      const { query } = req;
      const lineNumber = parseInt(query.lineNumber as string, 10) || 1;
      const colNumber = parseInt(query.colNumber as string, 10) || 1;
      launchEditor(
        getSourcePath(`${query.fileName}:${lineNumber}:${colNumber}`)
      );
      res.end();
      return;
    } else {
      next();
    }
  };
}
