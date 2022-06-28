import * as fs from 'fs';
import { getExports } from '@shuvi/service/lib/project/file-utils';
import { resolveFile } from '@shuvi/utils/lib/file';

export function ifComponentHasLoader(component: string) {
  const file = resolveFile(component);
  if (file) {
    const content = fs.readFileSync(file, 'utf-8');
    try {
      const exports = getExports(content);
      return exports.includes('loader');
    } catch {}
  }
  return false;
}
