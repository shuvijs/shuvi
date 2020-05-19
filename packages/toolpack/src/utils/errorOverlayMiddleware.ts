//@ts-ignore
import launchEditor from 'launch-editor';

export function createLaunchEditorMiddleware(launchEditorEndpoint: string) {
  return function launchEditorMiddleware(req: any, res: any, next: any) {
    if (req.url.startsWith(launchEditorEndpoint)) {
      const { query } = req.parsedUrl;
      const lineNumber = parseInt(query.lineNumber, 10) || 1;
      const colNumber = parseInt(query.colNumber, 10) || 1;
      launchEditor(`${query.fileName}:${lineNumber}:${colNumber}`);
      res.end();
    } else {
      next();
    }
  };
}
