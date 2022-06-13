import { buildFixture } from '../utils';
import { SpawnSyncReturns } from 'child_process';

jest.setTimeout(5 * 60 * 1000);

describe('Test build process with ignoreBuildErrors setting', () => {
  const fixture = 'project-with-type-error';

  test(`build fail without ignoreBuildErrors`, async () => {
    let error = false;
    let res: SpawnSyncReturns<string>;
    try {
      res = await buildFixture(fixture, {
        typescript: { ignoreBuildErrors: false }
      });
      if (res.error || res.status !== 0) {
        error = true;
      }
    } catch (err) {
      error = true;
    }
    expect(error).toBe(true);
  });

  test(`build successful with ignoreBuildErrors`, async () => {
    let error = false;
    let res: SpawnSyncReturns<string>;
    try {
      res = await buildFixture(fixture, {
        typescript: { ignoreBuildErrors: true }
      });
      if (res.error || res.status !== 0) {
        error = true;
      }
    } catch (err) {
      error = true;
    }
    expect(error).toBe(false);
  });
});
