import { getExportsContent } from './helpers';
import { getContentProxyObj } from './proxyObj';
import moduleExportProxy, {
  findFirstExistedFile,
  moduleExportProxyCreater
} from './moduleExportProxy';

const tsDeclareModule = (
  exports: { [source: string]: string | string[] },
  typeName: string
): string => {
  return `declare module '${typeName}' {
    ${getExportsContent(exports, true)}
  }`;
};

const exportsFromObject = (exports: { [source: string]: string[] }): string => getExportsContent(exports);

export interface FileSnippets {
  tsDeclareModule: typeof tsDeclareModule;
  exportsFromObject: typeof exportsFromObject;
  moduleExportProxy: typeof moduleExportProxy;
  getContentProxyObj: typeof getContentProxyObj;
  moduleExportProxyCreater: typeof moduleExportProxyCreater;
  findFirstExistedFile: typeof findFirstExistedFile;
}

export {
  tsDeclareModule,
  exportsFromObject,
  moduleExportProxy,
  getContentProxyObj,
  moduleExportProxyCreater,
  findFirstExistedFile
};
