import React from 'react';
import {
  render,
  cleanup,
  ReactTestInstance
} from 'shuvi-test-utils/reactTestRender';
import ModuleProxy from '../ModuleProxy';

afterEach(cleanup);

describe('ModuleProxy', () => {
  test('work with single source', () => {
    const { root } = render(<ModuleProxy name="test.js" source="a.js" />);
    const file = root.children[0] as ReactTestInstance;
    expect(file.props.name).toBe('test.js');
    expect(file.props.content).toBe('export * from "a.js"');
  });

  test('default exports', () => {
    const { root } = render(
      <ModuleProxy name="test.js" source="a.js" defaultExport />
    );
    const file = root.children[0] as ReactTestInstance;
    expect(file.props.name).toBe('test.js');
    expect(file.props.content).toBe(
      ['import temp from "a.js"', 'export default temp'].join('\n')
    );
  });
});
