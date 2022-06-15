import * as path from 'path';

export function resolveFixture(...paths: string[]) {
  return path.join(__dirname, 'fixtures', ...paths);
}
