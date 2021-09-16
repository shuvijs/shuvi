import path from 'path';
import { FileOptions, FileInternalInstance } from './file';
import { mount as mountFile } from './mount';
import { queueJob } from './scheduler';

export interface FileManager {
  addFile(options: FileOptions): void;
  mount(dir: string): Promise<void>;
  unmount(): Promise<void>;
}

export interface FileManagerOptions {
  watch?: boolean;
  context?: any;
}

export function getFileManager({
  watch = false,
  context
}: FileManagerOptions): FileManager {
  let hasMounted: boolean = false;
  let hasUnMounted: boolean = false;
  let rootDir = '';
  const files: FileOptions[] = [];
  const instances = new Map<string, FileInternalInstance>();

  const addFile = (options: FileOptions) => {
    if (hasUnMounted) {
      return;
    }
    files.push({
      ...options,
      name: options.name
    });

    if (hasMounted) {
      queueJob(() => {
        mount(rootDir);
      });
    }
  };

  const _mountFile = async (file: FileOptions) => {
    try {
      const inst = await mountFile(file, context, watch);
      instances.set(file.name, inst);
    } catch (error) {
      console.log(`fail to mount file ${file.name}`);
      console.error(error);
    }
  };

  const mount = async (dir: string) => {
    // rootDir is set while mounting
    rootDir = dir;
    if (!hasMounted) {
      hasMounted = true;
    }
    const tasks = [];
    const filesCopy = files.slice();
    files.length = 0;
    for (const file of filesCopy) {
      // rootDir as well as Full path name would not be set until mount
      file.name = path.resolve(rootDir, file.name);
      tasks.push(() => _mountFile(file));
    }

    await Promise.all(tasks.map(task => task()));
  };

  const unmount = async () => {
    const tasks = [];
    for (const [name, inst] of instances.entries()) {
      tasks.push(async () => {
        try {
          await inst.destroy();
          instances.delete(name);
        } catch (error) {
          console.log(`fail to unmount file ${name}`);
          console.error(error);
        }
      });
    }

    await Promise.all(tasks.map(task => task()));

    instances.clear();

    hasMounted = false;
    hasUnMounted = true;
  };

  return {
    addFile,
    mount,
    unmount
  };
}
