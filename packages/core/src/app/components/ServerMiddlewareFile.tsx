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
    .replace(/[\/\.]/g, '_')
    .replace(/\-/g, ' ')
    .replace(/\s(.)/g, s => s.toUpperCase())
    .replace(/\s/g, '')
    .replace(/^(.)/, s => s.toLowerCase());
}

function toParamterString(options: any[]) {
  return options.map(e => JSON.stringify(e)).join(', ');
}

function ServerMiddleware() {
  const serverMiddleware = useSelector(state => state.serverMiddleware);

  let exportContent = '';
  let content = '';

  const uniqueImports = new Map<string, string>();

  serverMiddleware.forEach(({ path, handler, options }) => {
    const importName = makeVariableName(handler);
    uniqueImports.set(handler, importName);
    exportContent += `\n  { path: "${path}", handler: ${
      options ? `${importName}(${toParamterString(options)})` : importName
    } },`;
  });

  uniqueImports.forEach((v, k) => {
    content += `import ${v} from "${k}";\n`;
  });

  content += `\nexport default [${exportContent}\n];`;

  return <File name="serverMiddleware.js" content={content} />;
}

export default observer(ServerMiddleware);
