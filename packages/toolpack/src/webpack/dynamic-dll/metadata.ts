import { join } from 'path';
import { existsSync, readJSONSync, writeJSONSync } from 'fs-extra';

import { METADATA_FILENAME, UPDATE_FILENAME } from './constants';
import { ModuleInfo } from './moduleCollector';
import { getDllDir } from './utils';

export interface Metadata {
  hash: string;
  buildHash: string;
  modules: Record<string, ModuleInfo>;
}

export interface Update {
  discovered: Record<string, ModuleInfo>;
}

let lastMetadata: Metadata | null = null;

function getNewModules(
  pre: Record<string, ModuleInfo>,
  next: Record<string, ModuleInfo>
) {
  const result: Record<string, ModuleInfo> = {};
  for (const key of Object.keys(next)) {
    let preItem = pre[key];
    let item = next[key];
    if (!preItem) {
      result[key] = item;
    } else if (preItem.version != item.version) {
      result[key] = item;
    }
  }
  return result;
}

export function getMetadata(root: string): Metadata {
  const file = join(getDllDir(root), METADATA_FILENAME);
  if (!existsSync(file)) {
    return {
      hash: '',
      buildHash: '',
      modules: {}
    };
  }

  return readJSONSync(file) as Metadata;
}

export function writeMetadata(root: string, content: Metadata) {
  writeJSONSync(join(root, METADATA_FILENAME), content, {
    spaces: 2
  });
  lastMetadata = content;
}

export function getUpdate(root: string): Update {
  const file = join(getDllDir(root), UPDATE_FILENAME);
  if (!existsSync(file)) {
    return {
      discovered: {}
    };
  }

  return readJSONSync(file) as Update;
}

export function writeUpdate(
  root: string,
  updateModules: Record<string, ModuleInfo>
) {
  if (!lastMetadata) {
    return;
  }

  writeJSONSync(
    join(getDllDir(root), UPDATE_FILENAME),
    {
      discovered: getNewModules(lastMetadata.modules, updateModules)
    },
    {
      spaces: 2
    }
  );
}
