import fs from 'fs';
import { buildFixture } from '../utils';

const fixtures = fs
  .readdirSync(__dirname)
  .filter((name) => name !== 'fixtures.test.ts');

describe('fixtures', () => {
  fixtures.forEach((fixture) => {
    test(
      `build ${fixture}`,
      async () => {
        expect.hasAssertions();
        await buildFixture(fixture);
        expect(true).toBe(true);
      },
      5 * 60 * 1000
    );
  });
});
