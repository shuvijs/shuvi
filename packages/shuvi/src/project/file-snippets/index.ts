import { getExportsContent } from './helpers';
import moduleExportProxy, {
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

const exportsFromObject = (exports: { [source: string]: string[] }): string =>
  getExportsContent(exports);

export {
  tsDeclareModule,
  exportsFromObject,
  moduleExportProxy,
  moduleExportProxyCreater
};
