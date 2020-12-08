import fse from 'fs-extra';
import { wait } from 'shuvi-test-utils';
import { render, cleanup, act } from 'shuvi-test-utils/reactTestRender';
import { useFileByOrder } from '../useFileByOrder';
import { resolveFixture } from './utils';

function file(name: string) {
  return resolveFixture('useFileByOrder', name);
}

function DumpComp({}: any) {
  return <div>empty</div>;
}

function TestComp({
  files = [],
  fallback
}: {
  files?: string[];
  fallback: string;
}) {
  const file = useFileByOrder(files, fallback);
  return <DumpComp value={file} />;
}

async function safeDelete(file: string) {
  try {
    await fse.unlink(file);
    await wait(1000);
  } catch {
    // ignore
  }
}

const fileA = file('a.js');
const fileB = file('b.js');
const unexistedFileC = file('c.js');

afterEach(cleanup);

describe('useFileByOrder', () => {
  test('should use fallback file', () => {
    const { root, update } = render(<TestComp fallback="fallback.js" />);
    expect(root.findByType(DumpComp).props.value).toBe('fallback.js');
    update(
      <TestComp
        files={['none-existed-1.js', 'none-existed-2.js']}
        fallback="fallback.js"
      />
    );
    expect(root.findByType(DumpComp).props.value).toBe('fallback.js');
  });

  test('should use first existed file', () => {
    const { root } = render(
      <TestComp files={[fileA, fileB]} fallback="fallback.js" />
    );
    expect(root.findByType(DumpComp).props.value).toBe(fileA);
  });

  test('should use first existed file 1', () => {
    const { root } = render(
      <TestComp files={['none-existed.js', fileA]} fallback="fallback.js" />
    );
    expect(root.findByType(DumpComp).props.value).toBe(fileA);
  });

  test('should update when the file occurs', async () => {
    try {
      const { root } = render(
        <TestComp files={[unexistedFileC]} fallback="fallback.js" />
      );
      expect(root.findByType(DumpComp).props.value).toBe('fallback.js');

      await act(async () => {
        await fse.writeFile(unexistedFileC, '', 'utf8');
        await wait(1000);
      });
      expect(root.findByType(DumpComp).props.value).toBe(unexistedFileC);
      // make sure to unmount before delete file
      cleanup();
    } finally {
      await safeDelete(unexistedFileC);
    }
  });

  test('should update when the file occurs 1', async () => {
    try {
      const { root } = render(
        <TestComp files={[unexistedFileC, fileA]} fallback="fallback.js" />
      );
      expect(root.findByType(DumpComp).props.value).toBe(fileA);

      await act(async () => {
        await fse.writeFile(unexistedFileC, '', 'utf8');
        await wait(1000);
      });
      expect(root.findByType(DumpComp).props.value).toBe(unexistedFileC);
      // make sure to unmount before delete file
      cleanup();
    } finally {
      await safeDelete(unexistedFileC);
    }
  });
});
