import React from 'react';
import { observer } from 'mobx-react';
import { File } from '@shuvi/react-fs';
import { useSelector } from '../models/store';

/**
 * 'koa-lowercase'    -> 'koaLowercase',
 * 'api/set-header'   -> 'api_setHeader',
 * 'api/health-check' -> 'api_healthCheck',
 */
function makeVariableName(str: string) {
  return str
    .replace(/\//g, '_')
    .replace(/\-/g, ' ')
    .replace(/\s(.)/g, s => s.toUpperCase())
    .replace(/\s/g, '')
    .replace(/^(.)/, s => s.toLowerCase());
}

function ServerMiddleware() {
  const serverMiddleware = useSelector(state => state.serverMiddleware);

  let exportContent = '';
  let content = '';

  const uniqueImports = new Map<string, string>();

  serverMiddleware.forEach(({ path, handler, resolved }) => {
    const importName = makeVariableName(handler);
    uniqueImports.set(resolved, importName);
    exportContent += `\n  { path: "${path}", handler: ${importName} },`;
  });

  uniqueImports.forEach((v, k) => {
    content += `import ${v} from "${k}"\n`;
  });

  content += `\nexport default [${exportContent}\n];`;

  return <File name="serverMiddleware.js" content={content} />;
}

export default observer(ServerMiddleware);
