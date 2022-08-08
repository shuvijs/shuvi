import launchEditor from 'launch-editor';
import { IncomingMessage, ServerResponse } from 'http';
import url from 'url';
import path from 'path';

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
  launchEditorEndpoint: string,
  rootDir: string
) {
  return function launchEditorMiddleware(
    req: IncomingMessage,
    res: ServerResponse,
    next: Function
  ) {
    if (req.url!.startsWith(launchEditorEndpoint)) {
      const { query } = url.parse(req.url!, true);
      const lineNumber = parseInt(query.lineNumber as string, 10) || 1;
      const colNumber = parseInt(query.colNumber as string, 10) || 1;
      const frameFile = query.fileName?.toString() || null;

      if (frameFile == null) {
        res.statusCode = 400;
        res.write('Bad Request');
        res.end();
        return;
      }

      const filePath = path.resolve(
        rootDir,
        getSourcePath(`${frameFile}:${lineNumber}:${colNumber}`)
      );

      launchEditor(filePath);
      res.end();
      return;
    } else {
      next();
    }
  };
}
