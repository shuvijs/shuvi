import fse from 'fs-extra';
import { readFileSync } from 'fs';
import { wait } from 'shuvi-test-utils';
import { moduleExportProxyCreater } from '../moduleExportProxy';
import { getFileManager, reactive } from '../../../file-manager';
import { resolveFixture } from './utils';

function file(name: string) {
  return resolveFixture('moduleExportProxyCreater', name);
}

async function safeDelete(file: string) {
  try {
    await fse.unlink(file);
    await wait(1000);
  } catch {
    // ignore
  }
}

afterEach(async () => {
  await wait(1000);
});

const fileA = file('a.js');
const fileB = file('b.js');
const unexistedFileC = file('c.js');

const FILE_RESULT = 'result-file.js';
const FILE_RESULT_2 = 'result-file-2.js';

describe('moduleExportProxyCreater', () => {
  test('should use fallback file', async () => {
    const source = 'fallback.js';
    const context = reactive({ source });
    const fm = getFileManager({ watch: true, context });
    const moduleExportProxy = moduleExportProxyCreater();
    fm.addFile({
      name: FILE_RESULT,
      content: (context: { source: string }) => {
        return moduleExportProxy.getContent(context.source);
      },
      mounted: moduleExportProxy.mounted,
      unmounted: moduleExportProxy.unmounted
    });
    await fm.mount(resolveFixture('moduleExportProxyCreater'));
    expect(readFileSync(file(FILE_RESULT), 'utf8')).toBe(
      'export * from "fallback.js"'
    );
    await fm.unmount();
  });

  test('should use first existed file', async () => {
    const source = [fileA, 'fallback.js'];
    const context = reactive({ source });
    const fm = getFileManager({ watch: true, context });
    const moduleExportProxy = moduleExportProxyCreater();
    fm.addFile({
      name: FILE_RESULT,
      content: (context: { source: string }) => {
        return moduleExportProxy.getContent(context.source);
      },
      mounted: moduleExportProxy.mounted,
      unmounted: moduleExportProxy.unmounted
    });
    await fm.mount(resolveFixture('moduleExportProxyCreater'));
    expect(readFileSync(file(FILE_RESULT), 'utf8')).toBe(
      `export * from "${fileA}"`
    );
    await fm.unmount();
  });

  test('should use first existed file yet another', async () => {
    const source = ['none-existed.js', fileA, 'fallback.js'];
    const context = reactive({ source });
    const fm = getFileManager({ watch: true, context });
    const moduleExportProxy = moduleExportProxyCreater();
    fm.addFile({
      name: FILE_RESULT,
      content: (context: { source: string }) => {
        return moduleExportProxy.getContent(context.source);
      },
      mounted: moduleExportProxy.mounted,
      unmounted: moduleExportProxy.unmounted
    });
    await fm.mount(resolveFixture('moduleExportProxyCreater'));
    expect(readFileSync(file(FILE_RESULT), 'utf8')).toBe(
      `export * from "${fileA}"`
    );
    await fm.unmount();
  });

  test('should update when the file occurs', async () => {
    const source = [unexistedFileC, 'fallback.js'];
    const context = reactive({ source });
    const fm = getFileManager({ watch: true, context });
    const moduleExportProxy = moduleExportProxyCreater();
    fm.addFile({
      name: FILE_RESULT,
      content: (context: { source: string }) => {
        return moduleExportProxy.getContent(context.source);
      },
      mounted: moduleExportProxy.mounted,
      unmounted: moduleExportProxy.unmounted
    });
    await fm.mount(resolveFixture('moduleExportProxyCreater'));
    expect(readFileSync(file(FILE_RESULT), 'utf8')).toBe(
      `export * from "fallback.js"`
    );

    await fse.writeFile(unexistedFileC, '', 'utf8');
    await wait(1000);

    expect(readFileSync(file(FILE_RESULT), 'utf8')).toBe(
      `export * from "${unexistedFileC}"`
    );
    await safeDelete(unexistedFileC);
    await fm.unmount();
  });

  test('should not update when the file occurs', async () => {
    const source = [unexistedFileC, 'fallback.js'];
    const context = reactive({ source });
    const fm = getFileManager({ watch: false, context });
    const moduleExportProxy = moduleExportProxyCreater();
    fm.addFile({
      name: FILE_RESULT,
      content: (context: { source: string }) => {
        return moduleExportProxy.getContent(context.source);
      },
      mounted: moduleExportProxy.mounted,
      unmounted: moduleExportProxy.unmounted
    });
    await fm.mount(resolveFixture('moduleExportProxyCreater'));
    expect(readFileSync(file(FILE_RESULT), 'utf8')).toBe(
      `export * from "fallback.js"`
    );

    await fse.writeFile(unexistedFileC, '', 'utf8');
    await wait(1000);

    expect(readFileSync(file(FILE_RESULT), 'utf8')).toBe(
      `export * from "fallback.js"`
    );
    await safeDelete(unexistedFileC);
    await fm.unmount();
  });

  test('should update when the file occurs yet another', async () => {
    const source = [unexistedFileC, fileA, 'fallback.js'];
    const context = reactive({ source });
    const fm = getFileManager({ watch: true, context });
    const moduleExportProxy = moduleExportProxyCreater();
    fm.addFile({
      name: FILE_RESULT,
      content: (context: { source: string }) => {
        return moduleExportProxy.getContent(context.source);
      },
      mounted: moduleExportProxy.mounted,
      unmounted: moduleExportProxy.unmounted
    });
    await fm.mount(resolveFixture('moduleExportProxyCreater'));
    expect(readFileSync(file(FILE_RESULT), 'utf8')).toBe(
      `export * from "${fileA}"`
    );

    await fse.writeFile(unexistedFileC, '', 'utf8');
    await wait(1000);

    expect(readFileSync(file(FILE_RESULT), 'utf8')).toBe(
      `export * from "${unexistedFileC}"`
    );
    await safeDelete(unexistedFileC);
    await fm.unmount();
  });

  test('should use first existed file when source updated', async () => {
    const source = ['fallback.js'];
    const context = reactive({ source });
    const fm = getFileManager({ watch: true, context });
    const moduleExportProxy = moduleExportProxyCreater();
    fm.addFile({
      name: FILE_RESULT,
      content: (context: { source: string | string[] }) => {
        const result = moduleExportProxy.getContent(context.source);
        return result;
      },
      mounted: moduleExportProxy.mounted,
      unmounted: moduleExportProxy.unmounted
    });
    await fm.mount(resolveFixture('moduleExportProxyCreater'));
    expect(readFileSync(file(FILE_RESULT), 'utf8')).toBe(
      'export * from "fallback.js"'
    );

    context.source.unshift(fileA);
    await wait(100);
    expect(readFileSync(file(FILE_RESULT), 'utf8')).toBe(
      `export * from "${fileA}"`
    );
    await fm.unmount();
  });

  test('should use first existed file when source updated yet another', async () => {
    const source1 = [fileA, 'fallback.js'];
    const source2 = [fileB, 'fallback.js'];
    const context = reactive({ source1, source2 });
    const fm = getFileManager({ watch: true, context });
    const moduleExportProxy1 = moduleExportProxyCreater();
    const moduleExportProxy2 = moduleExportProxyCreater();

    fm.addFile({
      name: FILE_RESULT,
      content: (context: { source1: string }) => {
        return moduleExportProxy1.getContent(context.source1);
      },
      mounted: moduleExportProxy1.mounted,
      unmounted: moduleExportProxy1.unmounted
    });

    fm.addFile({
      name: FILE_RESULT_2,
      content: (context: { source2: string }) => {
        return moduleExportProxy2.getContent(context.source2);
      },
      mounted: moduleExportProxy2.mounted,
      unmounted: moduleExportProxy2.unmounted
    });

    await fm.mount(resolveFixture('moduleExportProxyCreater'));
    expect(readFileSync(file(FILE_RESULT), 'utf8')).toBe(
      `export * from "${fileA}"`
    );
    expect(readFileSync(file(FILE_RESULT_2), 'utf8')).toBe(
      `export * from "${fileB}"`
    );

    context.source1.unshift(fileB);
    context.source2.unshift(unexistedFileC, fileA);
    await wait(100);
    expect(readFileSync(file(FILE_RESULT), 'utf8')).toBe(
      `export * from "${fileB}"`
    );
    expect(readFileSync(file(FILE_RESULT_2), 'utf8')).toBe(
      `export * from "${fileA}"`
    );

    await fse.writeFile(unexistedFileC, '', 'utf8');
    await wait(1000);
    expect(readFileSync(file(FILE_RESULT), 'utf8')).toBe(
      `export * from "${fileB}"`
    );
    expect(readFileSync(file(FILE_RESULT_2), 'utf8')).toBe(
      `export * from "${unexistedFileC}"`
    );

    await safeDelete(unexistedFileC);
    expect(readFileSync(file(FILE_RESULT), 'utf8')).toBe(
      `export * from "${fileB}"`
    );
    expect(readFileSync(file(FILE_RESULT_2), 'utf8')).toBe(
      `export * from "${fileA}"`
    );

    await fm.unmount();
  });
});
