import { createHookManager, createSyncHook } from '@shuvi/hook';
import * as path from 'path';

const test = createSyncHook();

export const getManager = () => createHookManager({ test }, false);

export const { createPlugin } = getManager();

export function resolvePlugin(name: string) {
  return path.join(__dirname, 'fixtures', 'plugins', name);
}

export function resolvePreset(name: string) {
  return path.join(__dirname, 'fixtures', 'presets', name);
}
