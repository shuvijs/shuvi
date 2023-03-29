import { loadFixture } from './utils';

test('should work without config file', async () => {
  const config = await loadFixture('empty');
  expect(config).toBeDefined();
});

test('should load config', async () => {
  const config = await loadFixture('base');
  expect(config.publicPath).toBe('/test');
});

test('should not load config when configPath is false', async () => {
  const config = await loadFixture('base', undefined, false);
  expect(config.publicPath).toBeUndefined();
});

test('should warn when customed configFile does not exist', async () => {
  const warn = jest
    .spyOn(global.console, 'warn')
    .mockImplementation(() => null);
  const config = await loadFixture(
    'base',
    {
      ssr: false
    },
    'none-exist-file'
  );

  expect(warn).toHaveBeenCalledWith(
    expect.stringMatching(/Config file not found:/)
  );
  expect(config.ssr).toBe(false);
});

test('should throw error when config file failed', async () => {
  expect.assertions(1);

  try {
    await loadFixture('error');
  } catch (err: any) {
    expect(err.message).toContain('Could not resolve "./notFound"');
  }
});
