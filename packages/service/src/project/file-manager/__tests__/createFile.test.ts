import fs from 'fs';
import path from 'path';
import { wait } from 'shuvi-test-utils';
import { getFileManager, createFile } from '../index';
import { getAllFiles } from '../../file-utils';
import { reactive } from '@vue/reactivity';
function resolveFixture(...paths: string[]) {
  return path.join(__dirname, 'fixtures', ...paths);
}

function file(...name: string[]) {
  return resolveFixture('createFile', ...name);
}

async function safeDelete(file: string) {
  try {
    fs.unlinkSync(file);
    await wait(500);
  } catch {
    // ignore
  }
}

const fileA = file('a');
const fileB = file('b');
const unexistedFileC = file('c');

const FILE_RESULT = 'result-file';

afterEach(async () => {
  await wait(500);
  fs.writeFileSync(fileA, 'a\n', 'utf8');
  fs.writeFileSync(fileB, 'b\n', 'utf8');
});

describe('createFile', () => {
  describe('should work with watching files', () => {
    describe('should work without using context', () => {
      test('should update when single dependency file update', async () => {
        const fileManager = getFileManager({ watch: true });
        fileManager.addFile(
          createFile({
            name: FILE_RESULT,
            content() {
              return fs.readFileSync(fileA, 'utf8') as string;
            },
            dependencies: fileA
          })
        );
        await fileManager.mount(resolveFixture('createFile'));
        expect(fs.readFileSync(file(FILE_RESULT), 'utf8')).toBe('a\n');
        fs.writeFileSync(fileA, 'aa\n', 'utf8');
        await wait(500);
        expect(fs.readFileSync(file(FILE_RESULT), 'utf8')).toBe('aa\n');
        await fileManager.unmount();
      });

      test('should update when multiple dependency files update', async () => {
        const fileManager = getFileManager({ watch: true });
        const dependencies = [fileA, fileB, unexistedFileC];
        fileManager.addFile(
          createFile({
            name: FILE_RESULT,
            content() {
              let content = '';
              dependencies.forEach(file => {
                if (fs.existsSync(file)) {
                  content += fs.readFileSync(file, 'utf8');
                }
              });
              return content;
            },
            dependencies
          })
        );
        await fileManager.mount(resolveFixture('createFile'));
        expect(fs.readFileSync(file(FILE_RESULT), 'utf8')).toBe('a\nb\n');
        fs.writeFileSync(fileA, 'aa\n', 'utf8');
        fs.writeFileSync(fileB, 'bb\n', 'utf8');
        await wait(500);
        expect(fs.readFileSync(file(FILE_RESULT), 'utf8')).toBe('aa\nbb\n');
        fs.writeFileSync(unexistedFileC, 'cc\n', 'utf8');
        await wait(500);
        expect(fs.readFileSync(file(FILE_RESULT), 'utf8')).toBe('aa\nbb\ncc\n');
        await fileManager.unmount();
        await safeDelete(unexistedFileC);
      });

      test('should update when dependency files and directories update', async () => {
        const fileManager = getFileManager({ watch: true });
        const directoryA = file('directory-a');
        const directoryB = file('directory-b');
        const daa = file('directory-a', 'aa');
        const dba = file('directory-b', 'ba');
        const dependencies = [
          fileA,
          fileB,
          unexistedFileC,
          directoryA,
          directoryB
        ];
        fileManager.addFile(
          createFile({
            name: FILE_RESULT,
            content() {
              let content = '';
              const allFiles = getAllFiles(dependencies);
              allFiles.forEach(file => {
                if (fs.existsSync(file)) {
                  content += fs.readFileSync(file, 'utf8');
                }
              });
              return content;
            },
            dependencies
          })
        );
        await fileManager.mount(resolveFixture('createFile'));
        expect(fs.readFileSync(file(FILE_RESULT), 'utf8')).toBe(
          'a\nb\ndaa\ndab\n'
        );
        fs.writeFileSync(fileA, 'aa\n', 'utf8');
        fs.writeFileSync(fileB, 'bb\n', 'utf8');
        fs.writeFileSync(unexistedFileC, 'cc\n', 'utf8');
        fs.writeFileSync(daa, 'daaa\n', 'utf8');
        fs.writeFileSync(dba, 'dba\n', 'utf8');
        await wait(500);
        expect(fs.readFileSync(file(FILE_RESULT), 'utf8')).toBe(
          'aa\nbb\ncc\ndaaa\ndab\ndba\n'
        );
        await fileManager.unmount();
        await safeDelete(unexistedFileC);
        await safeDelete(dba);
        fs.writeFileSync(daa, 'daa\n', 'utf8');
      });
    });

    describe('should work with using context', () => {
      test('should update when context as dependencies', async () => {
        const context = reactive({
          sources: [fileA, fileB, unexistedFileC]
        });
        const fileManager = getFileManager({ watch: true, context });
        fileManager.addFile(
          createFile<typeof context>(
            context => ({
              content() {
                let content = '';
                context.sources.forEach(file => {
                  if (fs.existsSync(file)) {
                    content += fs.readFileSync(file, 'utf8');
                  }
                });
                return content;
              },
              dependencies: context.sources
            }),
            FILE_RESULT
          )
        );
        await fileManager.mount(resolveFixture('createFile'));
        expect(fs.readFileSync(file(FILE_RESULT), 'utf8')).toBe('a\nb\n');
        fs.writeFileSync(fileA, 'aa\n', 'utf8');
        fs.writeFileSync(fileB, 'bb\n', 'utf8');
        await wait(500);
        expect(fs.readFileSync(file(FILE_RESULT), 'utf8')).toBe('aa\nbb\n');
        fs.writeFileSync(unexistedFileC, 'cc\n', 'utf8');
        await wait(500);
        expect(fs.readFileSync(file(FILE_RESULT), 'utf8')).toBe('aa\nbb\ncc\n');
        context.sources = [fileA, fileB];
        await wait(500);
        expect(fs.readFileSync(file(FILE_RESULT), 'utf8')).toBe('aa\nbb\n');
        await fileManager.unmount();
        await safeDelete(unexistedFileC);
      });
      test('should update when both context and dependencies change', async () => {
        const context = reactive({ extra: 'hello' });
        const fileManager = getFileManager({ watch: true, context });
        const dependencies = [fileA, fileB, unexistedFileC];
        fileManager.addFile(
          createFile<typeof context>(
            context => ({
              content() {
                let content = context.extra;
                dependencies.forEach(file => {
                  if (fs.existsSync(file)) {
                    content += fs.readFileSync(file, 'utf8');
                  }
                });
                return content;
              },
              dependencies
            }),
            FILE_RESULT
          )
        );
        await fileManager.mount(resolveFixture('createFile'));
        expect(fs.readFileSync(file(FILE_RESULT), 'utf8')).toBe('helloa\nb\n');
        fs.writeFileSync(fileA, 'aa\n', 'utf8');
        fs.writeFileSync(fileB, 'bb\n', 'utf8');
        await wait(500);
        expect(fs.readFileSync(file(FILE_RESULT), 'utf8')).toBe(
          'helloaa\nbb\n'
        );
        fs.writeFileSync(unexistedFileC, 'cc\n', 'utf8');
        context.extra = 'world';
        await wait(500);
        expect(fs.readFileSync(file(FILE_RESULT), 'utf8')).toBe(
          'worldaa\nbb\ncc\n'
        );
        await fileManager.unmount();
        await safeDelete(unexistedFileC);
      });
    });
  });
});