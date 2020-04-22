import React from 'react';
import { render, cleanup, ReactTestInstance } from 'shuvi-test-utils/reactTestRender';
import Module from '../Module';

afterEach(cleanup);

describe('Module', () => {
  test('single export', () => {
    const { root } = render(<Module name="test.js" exports={{ a: 'foo' }} />);
    const file = root.children[0] as ReactTestInstance;
    expect(file.props.name).toBe('test.js');
    expect(file.props.content).toBe('export { foo } from "a"');
  });

  test('multi export', () => {
    const { root } = render(
      <Module name="test.js" exports={{ a: ['foo', 'bar'] }} />
    );
    const file = root.children[0] as ReactTestInstance;
    expect(file.props.name).toBe('test.js');
    expect(file.props.content).toBe(
      ['export { foo } from "a"', 'export { bar } from "a"'].join('\n')
    );
  });

  test('renamed export', () => {
    const { root } = render(
      <Module
        name="test.js"
        exports={{ a: { imported: 'foo', local: 'aFoo' } }}
      />
    );
    const file = root.children[0] as ReactTestInstance;
    expect(file.props.name).toBe('test.js');
    expect(file.props.content).toBe('export { foo as aFoo } from "a"');
  });

  test('export all', () => {
    const { root } = render(<Module name="test.js" exports={{ a: true }} />);
    const file = root.children[0] as ReactTestInstance;
    expect(file.props.name).toBe('test.js');
    expect(file.props.content).toBe('export * from "a"');
  });
});
