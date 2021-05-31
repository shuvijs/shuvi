import { getFileManager, FileManager } from '../file-manager';
import {
  ProjectContext,
  createProjectContext,
  ISpecifier
} from './projectContext';

interface ProjectBuilderOptions {
  static: boolean;
  dir: string;
}

class ProjectBuilder {
  private _projectContext: ProjectContext;
  private _fileMagager: FileManager;

  constructor(option: ProjectBuilderOptions) {
    this._projectContext = createProjectContext();
    this._fileMagager = getFileManager({
      watch: !option.static,
      rootDir: option.dir,
      context: this._projectContext
    });
  }

  setEntryFileContent(content: string) {
    this._projectContext.entryFileContent = content;
  }

  addEntryCode(content: string) {
    this._projectContext.entryCodes.push(content);
  }

  addExport(source: string, specifier: ISpecifier[]) {
    this._projectContext.exports.set(source, specifier);
  }

  addPolyfill(file: string) {
    if (!this._projectContext.polyfills.includes(file)) {
      this._projectContext.polyfills.push(file);
    }
  }

  addRuntimePlugin(name: string, runtimePlugin: string) {
    this._projectContext.runtimePlugins.set(name, runtimePlugin);
  }

  async build(): Promise<void> {
    await this._fileMagager.mount();
  }

  async destory(): Promise<void> {
    await this._fileMagager.unmount();
  }
}

export { ProjectBuilder };
