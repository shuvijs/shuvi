import React from 'react';
import { create, act, ReactTestRenderer } from 'react-test-renderer';
import fse from 'fs-extra';
import { wait } from 'test-utils';
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
  fallback,
}: {
  files?: string[];
  fallback: string;
}) {
  const file = useFileByOrder(files, fallback);
  return <DumpComp value={file} />;
}

let currents: ReactTestRenderer[] = [];
function render(el: React.ReactElement): ReactTestRenderer {
  let root: ReactTestRenderer | undefined;
  act(() => {
    root = create(el);
    currents.push(root);
  });

  if (!root) {
    throw new Error();
  }

  const update = root.update;
  root.update = (el: React.ReactElement) => {
    act(() => {
      update.call(root, el);
    });
  };
  return root;
}

function cleanup() {
  const instances = currents.slice();
  currents.length = 0;
  instances.forEach((c) => c.unmount());
}

function safeDelete(file: string) {
  try {
    fse.unlinkSync(file);
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
        fse.writeFileSync(unexistedFileC, '', 'utf8');
        await wait(500);
      });
      expect(root.findByType(DumpComp).props.value).toBe(unexistedFileC);
    } finally {
      safeDelete(unexistedFileC);
    }
  });

  test('should update when the file occurs 1', async () => {
    try {
      const { root } = render(
        <TestComp files={[unexistedFileC, fileA]} fallback="fallback.js" />
      );
      expect(root.findByType(DumpComp).props.value).toBe(fileA);

      await act(async () => {
        fse.writeFileSync(unexistedFileC, '', 'utf8');
        await wait(500);
      });
      expect(root.findByType(DumpComp).props.value).toBe(unexistedFileC);
    } finally {
      safeDelete(unexistedFileC);
    }
  });
});
