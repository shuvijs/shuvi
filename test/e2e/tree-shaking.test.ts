import * as fs from 'fs';
import * as path from 'path';
import { AppCtx, serveFixture, resolveFixture } from '../utils';

const depa = 'depa';
const depb = 'depb';
const depc = 'depc';
const consoleDepaSymbol = 'consoleDepaSymbol';
const otherSymbol = 'ExportOther-other-symbol';

function getFileContent(
  manifest: any,
  fileName: string,
  from: string = 'loadble'
): string {
  let realFile = '';
  if (from === 'loadble') {
    const target = manifest.loadble;
    const loadbleKeys = Object.keys(target);
    for (let i = 0; i < loadbleKeys.length; i++) {
      const key = loadbleKeys[i];
      if (key.includes(fileName)) {
        realFile = target[key]['files'][0];
        break;
      }
    }
  } else if (from === 'bundles') {
    const target = manifest.bundles;
    const bundles = Object.keys(target);
    for (let i = 0; i < bundles.length; i++) {
      const key = bundles[i];
      if (key.includes(fileName)) {
        realFile = target[key];
        break;
      }
    }
  }
  if (!realFile) {
    throw new Error(`con't find webpack bundle file: ${fileName}`);
  }
  const fileDir = resolveFixture('tree-shaking/build/client/');
  const fileContent = fs.readFileSync(path.join(fileDir, realFile), 'utf-8');
  return fileContent;
}

jest.setTimeout(5 * 60 * 1000);

describe('Tree Shaking', () => {
  let ctx: AppCtx;
  let manifest: any;

  beforeAll(async () => {
    Object.assign(process.env, {
      NODE_ENV: 'production'
    });
    ctx = await serveFixture('tree-shaking');
    manifest = await require(resolveFixture(
      'tree-shaking/build/build-manifest.client.json'
    ));
  });
  afterAll(async () => {
    await ctx.close();
  });

  test('just import xx, but no use. xx and what it depends will be remove', async () => {
    const fileContent = getFileContent(manifest, 'use-no');
    expect(fileContent).not.toMatch(depa);
    expect(fileContent).not.toMatch(depb);
    expect(fileContent).not.toMatch(depc);
    expect(fileContent).not.toMatch(consoleDepaSymbol);
  });

  test('when import { xx } from yy. should keep xx and xx depends', async () => {
    const fileContent = getFileContent(manifest, 'use-consoleDepa');
    expect(fileContent).toMatch(depa);
    expect(fileContent).toMatch(depb);
    expect(fileContent).not.toMatch(depc);
    expect(fileContent).toMatch(consoleDepaSymbol);
  });

  test('when import reexport { xx } form yy. just keep xx, what is the xx not export should be remove', async () => {
    const fileContent = getFileContent(manifest, 'use-depb');
    expect(fileContent).toMatch(depa);
    expect(fileContent).toMatch(depb);
    expect(fileContent).not.toMatch(depc);
    expect(fileContent).not.toMatch(consoleDepaSymbol);
  });

  test('route page should only keep default and remove loader', async () => {
    const fileContent = getFileContent(manifest, 'export-other');
    expect(fileContent).toMatch('ExportOther-default-symbol');
    expect(fileContent).not.toMatch('ExportOther-loader-symbol');
    expect(fileContent).not.toMatch(otherSymbol);
  });

  test("main entry should only keep page's loader and remove other export", async () => {
    const fileContent = getFileContent(manifest, 'main', 'bundles');
    expect(fileContent).toMatch('ExportOther-loader-symbol');
    expect(fileContent).not.toMatch('ExportOther-default-symbol');
    expect(fileContent).not.toMatch(otherSymbol);
  });
});
