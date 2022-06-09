import * as path from 'path';
import * as fse from 'fs-extra';
import { Defer } from '@shuvi/utils';
import { effect, stop } from '@vue/reactivity';
import { FileOptions, createFileInstance } from './file';
import { queueJob, queuePostFlushCb } from './scheduler';
import { invokeArrayFns } from './utils';
import { FileInternalInstance } from './fileTypes';

export function mount(
  options: FileOptions,
  context: any = {},
  watch: boolean
): Promise<FileInternalInstance> {
  const defer = Defer<FileInternalInstance>();
  const instance = createFileInstance(options);

  const { content, name: fsPath, setupState } = instance;
  const dir = path.dirname(fsPath);
  let fd: any;
  const componentEffect = async () => {
    // mount
    if (!instance.isMounted) {
      fse.ensureDirSync(dir);
      fd = fse.openSync(fsPath, 'w+');
      const fileContent = await content(context, setupState);
      if (fileContent != undefined) {
        fse.writeSync(fd, fileContent, 0);
      }
      /**
       * `mounted` hook could be excuted only in watch mode
       */
      if (watch) {
        invokeArrayFns(instance.mounted);
      }
      instance.isMounted = true;
      defer.resolve(instance);
      return;
    }
    const fileContent = await content(context, setupState);
    fse.ftruncateSync(fd, 0);
    fse.writeSync(fd, fileContent, 0);
  };
  if (watch) {
    instance.update = effect(componentEffect, {
      scheduler: queueJob,
      allowRecurse: true,
      onStop: () => {
        console.log('stopped');
      }
      // lazy: true,
    });
  } else {
    componentEffect();
  }

  instance.destroy = () => {
    const destroyDefer = Defer<void>();
    const { effects, update, unmounted, name: fsPath } = instance;

    fse.removeSync(fsPath);

    if (effects) {
      for (let i = 0; i < effects.length; i++) {
        stop(effects[i]);
      }
    }

    if (update) {
      stop(update);
    }

    /**
     * `unmounted` hook could be excuted only in watch mode
     */
    if (watch) {
      queuePostFlushCb(() => {
        invokeArrayFns(unmounted);
      });
    }
    queuePostFlushCb(() => {
      instance.isUnmounted = true;
      destroyDefer.resolve();
    });
    return destroyDefer.promise;
  };

  return defer.promise;
}
