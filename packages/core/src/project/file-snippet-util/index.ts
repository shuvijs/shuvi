import { watch } from '@shuvi/utils/lib/fileWatcher';
import { reactive } from '../../file-manager';
import { ISpecifier, getExportsContent } from './helpers';
import moduleExportProxy, {
  moduleExportProxyCreater
} from './moduleExportProxy';

const definitionTSFile = (
  exports: { [source: string]: ISpecifier | ISpecifier[] },
  typeName: string
): string => {
  return `declare module '${typeName}' {
    ${getExportsContent(exports, true)}
  }`;
};

const moduleExport = (exports: {
  [source: string]: ISpecifier | ISpecifier[];
}): string => getExportsContent(exports);

const fileSnippetUtil = {
  definitionTSFile,
  moduleExport,
  moduleExportProxy,
  moduleExportProxyCreater
};

export default fileSnippetUtil;
export { watch, reactive };
