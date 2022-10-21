import * as path from 'path';

export function resolveFixture(...paths: string[]) {
  return path.resolve(__dirname, '..', 'fixtures', ...paths);
}
