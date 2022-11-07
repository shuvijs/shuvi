import * as fs from 'fs';
import * as path from 'path';
import { AppCtx, Page, devFixture, resolveFixture } from '../utils';

async function getClientFileContent(
  fixture: string,
  fileName: string
): Promise<string> {
  const manifestPath = resolveFixture(
    `${fixture}/build/build-manifest.client.json`
  );
  const manifestContent = await fs.promises.readFile(manifestPath, {
    encoding: 'utf-8'
  });
  const manifest = JSON.parse(manifestContent);

  let realFile = '';
  const target = manifest.loadble;
  const loadbleKeys = Object.keys(target);
  for (let i = 0; i < loadbleKeys.length; i++) {
    const key = loadbleKeys[i];
    if (key.includes(fileName)) {
      realFile = target[key]['files'][0];
      break;
    }
  }
  if (!realFile) {
    throw new Error(`con't find webpack bundle file: ${fileName}`);
  }
  const fileDir = resolveFixture(`${fixture}/build/client/`);
  const fileContent = fs.readFileSync(path.join(fileDir, realFile), 'utf-8');
  return fileContent;
}

async function getServerFileContent(
  fixture: string,
  fileName: string
): Promise<string> {
  const manifestPath = resolveFixture(
    `${fixture}/build/build-manifest.server.json`
  );
  const manifestContent = await fs.promises.readFile(manifestPath, {
    encoding: 'utf-8'
  });
  const manifest = JSON.parse(manifestContent);

  let realFile = '';
  const target = manifest.chunkRequest;
  const chunksKeys = Object.keys(target);
  for (let i = 0; i < chunksKeys.length; i++) {
    const key = chunksKeys[i];
    if (target[key].includes(fileName)) {
      realFile = key;
      break;
    }
  }
  if (!realFile) {
    throw new Error(`con't find webpack bundle file: ${fileName}`);
  }
  const fileDir = resolveFixture(`${fixture}/build/server/`);
  const fileContent = fs.readFileSync(path.join(fileDir, realFile), 'utf-8');
  return fileContent;
}

jest.setTimeout(5 * 60 * 1000);

describe('plugin', () => {
  let ctx: AppCtx;
  let page: Page;
  afterEach(async () => {
    jest.resetAllMocks();
    await page.close();
    await ctx.close();
  });

  test('should work with npm packages plugin', async () => {
    jest.spyOn(console, 'error');
    const consoleSpy = jest.spyOn(console, 'error');
    const pluginName = 'shuvi-plugin-sample';
    ctx = await devFixture('plugin-and-preset', {
      ssr: true,
      plugins: [[pluginName, pluginName]]
    });
    page = await ctx.browser.page(ctx.url('/'));
    const consoleResult = consoleSpy.mock.calls.join('');
    expect(consoleResult).toMatch(pluginName + 'core');
    expect(consoleResult).toMatch(pluginName + 'server');
    expect(consoleResult).toMatch(pluginName + 'runtime');
  });

  test('should work with npm packages preset', async () => {
    jest.spyOn(console, 'error');
    const consoleSpy = jest.spyOn(console, 'error');
    const presetName = 'shuvi-preset-sample';
    ctx = await devFixture('plugin-and-preset', {
      ssr: true,
      presets: [[presetName, presetName]]
    });
    page = await ctx.browser.page(ctx.url('/'));
    const consoleResult = consoleSpy.mock.calls.join('');
    expect(consoleResult).toMatch(presetName + 'core');
    expect(consoleResult).toMatch(presetName + 'server');
    expect(consoleResult).toMatch(presetName + 'runtime');
  });

  test('should ignore node_modules libs', async () => {
    ctx = await devFixture('plugin-and-preset');
    page = await ctx.browser.page(ctx.url('/node-external'));
    const lodashRegex = /\/\*! lodash \*\/ \"(.*?)\"\)/;

    const serverContent = await getServerFileContent(
      'plugin-and-preset',
      'node-external'
    );
    const serverLodashSource = serverContent.match(lodashRegex);
    expect(serverLodashSource).not.toBe(null);
    expect(serverLodashSource![1]).toBe('lodash');

    const clientContent = await getClientFileContent(
      'plugin-and-preset',
      'node-external'
    );
    const clientLodashSource = clientContent.match(lodashRegex);
    expect(clientLodashSource).not.toBe(null);
    expect(clientLodashSource![1]).toContain('lodash');
    expect(clientLodashSource![1]).toContain('node_modules');
  });
});
