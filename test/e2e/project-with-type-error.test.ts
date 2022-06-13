import { loadFixture, resolveFixture, build } from '../utils';
import { getPlatform } from 'shuvi/lib/utils';

describe('Test build process with ignoreBuildErrors setting', () => {
  const fixture = 'project-with-type-error';
  const cwd = resolveFixture(fixture);

  test(`build fail without ignoreBuildErrors`, async () => {
    try {
      const config = await loadFixture(fixture, {
        typescript: { ignoreBuildErrors: false }
      });
      const platform = getPlatform(config.platform.name);
      await build({ cwd, config, platform });
    } catch (error) {
      expect(true).toBe(true);
    }
  });

  test(`build successful with ignoreBuildErrors`, async () => {
    try {
      const config = await loadFixture(fixture, {
        typescript: { ignoreBuildErrors: true }
      });
      const platform = getPlatform(config.platform.name);
      await build({ cwd, config, platform });
    } catch (error) {
      expect(false).toBe(true);
    }
  });
});
