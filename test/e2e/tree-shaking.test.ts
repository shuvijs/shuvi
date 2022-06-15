import * as fs from 'fs';
import * as path from 'path';
import { AppCtx, serveFixture, resolveFixture } from '../utils';

const depa = 'depa';
const depb = 'depb';
const depc = 'depc';
const consoleDepaSymbol = 'consoleDepaSymbol';
const otherSymbol = 'other-symbol';

function getFileContent(manifest: any, fileName: string): string {
  let realFile = '';
  const loadbleKeys = Object.keys(manifest.loadble);
  for (let i = 0; i < loadbleKeys.length; i++) {
    const key = loadbleKeys[i];
    if (key.includes(fileName)) {
      realFile = manifest.loadble[key]['files'][0];
      break;
    }
  }
  if (!realFile) {
    throw new Error(`con't find webpack bundle file: ${fileName}`);
  }
  const fileDir = resolveFixture('tree-shaking/dist/client/');
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
      'tree-shaking/dist/client/build-manifest.json'
    ));
  });
  afterAll(async done => {
    await ctx.close();
    done();
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

  test('jest keep route page default', async () => {
    const fileContent = getFileContent(manifest, 'export-other');
    expect(fileContent).not.toMatch(otherSymbol);
  });

  test('a route page can import other route page export', async () => {
    const fileContent = getFileContent(manifest, 'import-other-from-page');
    expect(fileContent).toMatch(otherSymbol);
  });
});
