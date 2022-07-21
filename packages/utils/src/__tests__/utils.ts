import * as path from 'path';
import fse from 'fs-extra';

export function resolveFixture(name: string) {
  return path.join(__dirname, 'fixtures', name);
}

export function copyDirectory(source: string, target: string) {
  fse.copySync(source, target);
}

export function deleteDirectory(source: string) {
  fse.removeSync(source);
}
