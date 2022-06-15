import * as path from 'path';
import { execSync } from 'child_process';

export function resolveFixture(name: string) {
  return path.join(__dirname, 'fixtures', name);
}

export function copyDirectory(source: string, target: string) {
  execSync(`cp -R ${source} ${target}`);
}

export function deleteDirectory(source: string) {
  execSync(`rm -rf ${source}`);
}
