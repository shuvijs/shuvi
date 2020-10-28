import path from 'path';

export function resolvePlugin(name: string) {
  return path.join(__dirname, 'fixtures', 'plugins', name);
}

export function resolvePreset(name: string) {
  return path.join(__dirname, 'fixtures', 'presets', name);
}

export function resolveMiddleware(name: string) {
  return path.join(__dirname, 'fixtures', 'middlewares', name);
}
