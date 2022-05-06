import webpack from '@shuvi/toolpack/lib/webpack';
import { loadFixture } from './utils';

const dotEnvConfigInlineSnapShot = `
Object {
  "conflictEnvShouldBeDevelopmentLocal": "development.local",
  "envLocalShouldBeTrue": "true",
  "shouldBe123": "123",
  "shouldBeBar": "bar",
  "shouldBeUndefined": undefined,
}
`;

test('should work without config file', async () => {
  const config = await loadFixture('empty');
  expect(config).toBeDefined();
});

test('should load config', async () => {
  const config = await loadFixture('base');
  expect(config.ssr).toBe(true);
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

  expect(config.env).toMatchInlineSnapshot(dotEnvConfigInlineSnapShot);
});

test('should load config in esmodule', async () => {
  Object.assign(process.env, {
    NODE_ENV: 'development'
  });

  const config = await loadFixture('esm');

  expect(config.env).toMatchInlineSnapshot(dotEnvConfigInlineSnapShot);
  expect((config as any).webpack).toBe(webpack);
});

test('should load config in typescript', async () => {
  Object.assign(process.env, {
    NODE_ENV: 'development'
  });

  const config = await loadFixture('typescript');

  expect(config.env).toMatchInlineSnapshot(dotEnvConfigInlineSnapShot);
});

test('should load config in typescript using defineConfig', async () => {
  Object.assign(process.env, {
    NODE_ENV: 'development'
  });

  const config = await loadFixture('typescript');

  expect(config.env).toMatchInlineSnapshot(dotEnvConfigInlineSnapShot);
});

test('should throw error when config file failed', async () => {
  expect.assertions(1);

  try {
    await loadFixture('error');
  } catch (err: any) {
    expect(err.message).toContain('Could not resolve "./notFound"');
  }
});
