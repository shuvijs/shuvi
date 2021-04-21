import path from 'path';
import fse from 'fs-extra';
import { Defer } from '@shuvi/utils';
import { effect, stop } from '@vue/reactivity';
import { FileOptions, createFileInstance } from './file';
import { queueJob, queuePostFlushCb } from './scheduler';
import { invokeArrayFns } from './utils';
import { FileInternalInstance } from './fileTypes';

export function mount(options: FileOptions): Promise<FileInternalInstance> {
  const defer = Defer<FileInternalInstance>();
  const instance = createFileInstance(options);

  const { content, name: fsPath } = instance;
  const dir = path.dirname(fsPath);
  let fd: any;
  instance.update = effect(
    function componentEffect() {
      // mount
      if (!instance.isMounted) {
        fse.ensureDirSync(dir);
        fd = fse.openSync(fsPath, 'w+');
        const fileContent = content();
        fse.writeSync(fd, fileContent, 0);
        invokeArrayFns(instance.mounted);
        instance.isMounted = true;
        defer.resolve(instance);
        return;
      }

      const fileContent = content();
      fse.ftruncateSync(fd, 0);
      fse.writeSync(fd, fileContent, 0);
    },
    {
      scheduler: queueJob,
      allowRecurse: true
      // lazy: true,
    }
  );

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

    queuePostFlushCb(() => {
      invokeArrayFns(unmounted);
    });
    queuePostFlushCb(() => {
      instance.isUnmounted = true;
      destroyDefer.resolve();
    });
    return destroyDefer.promise;
  };

  return defer.promise;
}
