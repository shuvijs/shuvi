import path from 'path';

export function resolvePlugin(name: string) {
  return path.join(__dirname, 'fixtures', 'plugins', name);
}
