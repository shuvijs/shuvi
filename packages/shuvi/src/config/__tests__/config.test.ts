import { loadFixture, resolveFixture } from './utils';
import { loadConfig } from '..';

describe('config', () => {
  test('should work without config file', async () => {
    const config = await loadFixture('empty');

    expect(config.rootDir?.endsWith('fixtures/empty')).toBe(true);
  });

  test('should load config', async () => {
    const config = await loadFixture('base');

    expect(config.ssr).toBe(true);
    expect(config.rootDir).toBe(resolveFixture('base'));
  });

  test('should use process.cwd for rootDir when rootDir is not specified', async () => {
    const config = await loadConfig();

    expect(config.rootDir).toBe(process.cwd());
  });

  test('should overwrite config with userConfig ', async () => {
    const config = await loadFixture('base', {
      ssr: false,
      publicDir: './public-dir'
    });

    expect(config.publicDir).toBe('./public-dir');
    expect(config.ssr).toBe(false);
  });

  test('should warn when customed configFile does not exist', async () => {
    const warn = jest
      .spyOn(global.console, 'warn')
      .mockImplementation(() => null);
    const config = await loadFixture(
      'base',
      {
        ssr: false,
        publicDir: './'
      },
      'none-exist-file'
    );

    expect(warn).toHaveBeenCalledWith(
      expect.stringMatching(/Config file not found:/)
    );
    expect(config.ssr).toBe(false);
    expect(config.publicDir).toBe('./');
  });

  test('should inject dotenv into config', async () => {
    Object.assign(process.env, {
      NODE_ENV: 'development'
    });

    const config = await loadFixture('dotenv');

    expect(config.env).toMatchInlineSnapshot(`
      Object {
        "conflictEnvShouldBeDevelopmentLocal": "development.local",
        "envLocalShouldBeTrue": "true",
        "shouldBe123": "123",
        "shouldBeBar": "bar",
        "shouldBeUndefined": undefined,
      }
    `);
  });

  test('should throw error when config file failed', async () => {
    expect.assertions(1);

    try {
      await loadFixture('error');
    } catch (e) {
      expect(
        e.message.startsWith(
          "Cannot find module './notFound' from 'shuvi.config.js'"
        )
      ).toBe(true);
    }
  });
});
