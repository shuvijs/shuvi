import launchEditor from 'launch-editor';
import { IncomingMessage, ServerResponse } from 'http';
import url from 'url';
import path from 'path';
import { getSourcePath } from './helper';

export function launchEditorMiddleware(
  launchEditorEndpoint: string,
  rootDir: string
) {
  return function (req: IncomingMessage, res: ServerResponse, next: Function) {
    if (req.url!.startsWith(launchEditorEndpoint)) {
      const { query } = url.parse(req.url!, true);
      const lineNumber = parseInt(query.lineNumber as string, 10) || 1;
      const colNumber = parseInt(query.colNumber as string, 10) || 1;
      const frameFile = query.file?.toString() || null;

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
