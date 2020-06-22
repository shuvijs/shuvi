import { loadFixture, resolveFixture } from './utils';
import { loadConfig } from '..';

describe('config', () => {
  test('should load config', async () => {
    const config = await loadFixture('base');

    expect(config.ssr).toBe(true);
    expect(config.rootDir).toBe(resolveFixture('base'));
  });

  test('should use process.cwd for rootDir when rootDir is not specified', async () => {
    const config = await loadConfig(undefined, {});

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

  test('should not load config when userConfig is given and configFile is undefined', async () => {
    const config = await loadFixture(
      'base',
      {
        ssr: false,
        publicDir: './'
      },
      false
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

  test('should throw error when configFile is invalid', () => {
    expect(loadConfig('example')).rejects.toThrowErrorMatchingInlineSnapshot(
      `"configFile expect to end with 'shuvi.config.js', but recevied 'example'"`
    );
  });

  test('should throw error when configFile and userConfig is not defined', () => {
    expect(loadConfig()).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Expected either configFile or config to be defined."`
    );
  });
});
