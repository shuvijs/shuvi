import { execSync } from 'child_process';
import { vol } from 'memfs';
import * as fs from 'fs';
import * as path from 'path';

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

export function copyDirectory(source: string, target: string) {
  execSync(`cp -R ${source} ${target}`);
}

export function deleteDirectory(source: string) {
  execSync(`rm -rf ${source}`);
}
