import { createHookManager, createSyncHook } from '@shuvi/hook';
import * as path from 'path';

const test = createSyncHook<void, void, string>();

export const getManager = () => createHookManager({ test }, false);

export const { createPlugin } = getManager();

export function resolveFxiture(name: string) {
  return path.join(__dirname, 'fixtures', name);
}

export function resolvePlugin(name: string) {
  return path.join(__dirname, 'fixtures', 'plugins', name);
}

export function resolvePreset(name: string) {
  return path.join(__dirname, 'fixtures', 'presets', name);
}
