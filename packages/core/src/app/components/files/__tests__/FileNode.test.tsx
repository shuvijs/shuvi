import React from 'react';
import { render, cleanup } from 'shuvi-test-utils/reactTestRender';
import FileNode from '../FileNode';
import { createFile, createCustomFile } from '../../../models/files';

afterEach(cleanup);

describe('FileNode', () => {
  test('should render file', () => {
    const { toJSON } = render(
      <FileNode file={createFile('test.js', { content: 'var test = 1' })} />
    );
    const json = toJSON();
    expect(json).toMatchObject({
      type: 'file',
      props: { name: 'test.js', content: 'var test = 1' },
      children: null
    });
  });

  test('should render custom file', () => {
    function CustomeFile({ content }: any) {
      return <div>{content}</div>;
    }

    const { toJSON } = render(
      <FileNode
        file={createCustomFile('test.txt', CustomeFile, {
          content: 'foo'
        })}
      />
    );
    const json = toJSON();
    expect(json).toMatchObject({
      type: 'div',
      children: ['foo']
    });
  });
});
