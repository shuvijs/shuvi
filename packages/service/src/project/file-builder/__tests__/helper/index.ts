import { vol } from 'memfs';
import * as fs from 'fs-extra';
import * as path from 'path';

export { copySync, emptyDirSync } from 'fs-extra';

export function resetFs() {
  vol.reset();
}

export function readFileSync(filepath: string) {
  return fs.readFileSync(filepath, 'utf-8');
}

export function writeFileSync(filepath: string, data: any) {
  fs.writeFileSync(filepath, data, 'utf-8');
}

export function readDirSync(dir: string): string[] {
  return fs.readdirSync(dir).sort();
}

export function sleep(timeout: number) {
  return new Promise(resolve => setTimeout(resolve, timeout));
}

export function resolveFixture(...names: string[]) {
  return path.resolve(__dirname, '..', 'fixtures', ...names);
}
