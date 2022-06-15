import * as fs from 'fs';
import * as path from 'path';
import { SpawnSyncReturns } from 'child_process';
import * as utils from '../utils';

const fixtures = fs.readdirSync(__dirname).filter(name => {
  if (name === 'fixtures.test.ts') {
    return false;
  }

  const fullpath = path.join(__dirname, name);
  const stat = fs.statSync(fullpath);
  return stat.isDirectory();
});

describe.skip('fixtures', () => {
  fixtures.forEach(fixture => {
    test(
      `build ${fixture}`,
      () => {
        expect.hasAssertions();
        let res: SpawnSyncReturns<string>;
        res = utils.buildFixture(fixture);
        if (res.status !== 0) {
          console.log(`fail to build fixture ${fixture}`);
          console.error(res.output);
        } else {
          expect(true).toBe(true);
        }
      },
      5 * 60 * 1000
    );
  });
});
