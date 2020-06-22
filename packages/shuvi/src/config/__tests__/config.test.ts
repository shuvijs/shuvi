import { loadFixture, resolveFixture } from './utils';

afterEach(() => {
  jest.resetModules();
});

describe('config', () => {
  test('should load config', async () => {
    const config = await loadFixture('base');

    expect(config.ssr).toBe(true);
    expect(config.rootDir).toBe(resolveFixture('base'));
  });

  test('should not load config when userConfig is given', async () => {
    const config = await loadFixture('base', {
      ssr: false,
      rootDir: './'
    });

    expect(config.ssr).toBe(false);
    expect(config.rootDir).toBe('./');
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
});
