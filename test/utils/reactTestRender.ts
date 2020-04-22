import { create, act, ReactTestRenderer, ReactTestInstance } from 'react-test-renderer';

export { act, ReactTestInstance };

let currents: ReactTestRenderer[] = [];
export function render(el: React.ReactElement): ReactTestRenderer {
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

export function cleanup() {
  const instances = currents.slice();
  currents.length = 0;
  instances.forEach(c => c.unmount());
}
