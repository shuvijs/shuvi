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

describe('fixtures', () => {
  fixtures.forEach(fixture => {
    test(
      `build ${fixture}`,
      () => {
        let success;
        let res: SpawnSyncReturns<string>;
        res = utils.buildFixture(fixture);
        if (res.status !== 0) {
          console.log(`fail to build fixture ${fixture}`);
          console.error(res.output);
          success = false;
        } else {
          success = true;
        }

        expect(success).toBe(true);
      },
      10 * 60 * 1000
    );
  });
});
