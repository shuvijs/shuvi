import path from 'path';
import { stop } from '@vue/reactivity';
import { FileOptions, FileInternalInstance } from './file';
import { mount as mountFile } from './mount';
import { queueJob } from './scheduler';

export interface FileManager {
  addFile(options: FileOptions): void;
  mount(): Promise<void>;
  unmount(): Promise<void>;
}

export interface FileManagerOptions {
  watch?: boolean;
  rootDir: string;
  context?: any;
}

export function getFileManager({
  watch = false,
  rootDir,
  context
}: FileManagerOptions): FileManager {
  let hasMounted: boolean = false;
  let hasUnMounted: boolean = false;
  const files: FileOptions[] = [];
  const instances = new Map<string, FileInternalInstance>();

  const addFile = (options: FileOptions) => {
    if (hasUnMounted) {
      return;
    }

    const fullPath = path.resolve(rootDir, options.name);
    files.push({
      ...options,
      name: fullPath
    });

    if (hasMounted) {
      queueJob(mount);
    }
  };

  const _mountFile = async (file: FileOptions) => {
    try {
      const inst = await mountFile(file, context);
      if (!watch) {
        stop(inst.update);
      }
      instances.set(file.name, inst);
    } catch (error) {
      console.log(`fail to mount file ${file.name}`);
      console.error(error);
    }
  };

  const mount = async () => {
    if (!hasMounted) {
      hasMounted = true;
    }
    const tasks = [];
    const filesCopy = files.slice();
    files.length = 0;
    for (const file of filesCopy) {
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
