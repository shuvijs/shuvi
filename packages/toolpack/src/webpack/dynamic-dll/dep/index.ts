import { join } from 'path';
import { MF_VA_PREFIX } from '../constants';
import { getExposeFromContent } from './getExposeFromContent';

function trimFileContent(content: string) {
  return content.trim() + '\n';
}

export class Dep {
  public request: string;
  public version: string | null;
  public libraryPath: string;
  public filename: string;

  constructor(opts: {
    outputPath: string;
    request: string;
    libraryPath: string;
    version: string | null;
  }) {
    this.request = opts.request;
    this.libraryPath = opts.libraryPath;
    this.version = opts.version;
    const name = this.request.replace(/\//g, '_').replace(/:/g, '_');
    this.filename = join(opts.outputPath, `${MF_VA_PREFIX}${name}.js`);
  }

  async buildExposeContent() {
    // node natives
    // @ts-ignore
    const isNodeNatives = !!process.binding('natives')[this.request];
    if (isNodeNatives) {
      return trimFileContent(`
import _ from '${this.request}';
export default _;
export * from '${this.request}';
      `);
    }

    return await getExposeFromContent(this.libraryPath);
  }
}
