import path from 'path';

export function resolveFixture(...names: string[]) {
  return path.join(__dirname, 'fixtures', ...names);
}
