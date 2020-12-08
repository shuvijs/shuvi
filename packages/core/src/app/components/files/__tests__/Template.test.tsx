import path from 'path';
import { ReactTestRendererJSON } from 'react-test-renderer';
import { render, cleanup } from 'shuvi-test-utils/reactTestRender';
import Template from '../Template';

function resolveFixture(...paths: string[]) {
  return path.join(__dirname, 'fixtures', ...paths);
}

afterEach(cleanup);

describe('Template', () => {
  test('work with content', () => {
    const { toJSON } = render(
      <Template name="test.js" content="var test = 1" />
    );
    const json = toJSON();
    expect(json).toMatchObject({
      type: 'file',
      props: { name: 'test.js', content: 'var test = 1' },
      children: null
    });
  });

  test('should compile template with data', () => {
    const { toJSON } = render(
      <Template
        name="test.js"
        content="var test = <%= test %>"
        data={{ test: '1' }}
      />
    );
    const json = toJSON();
    expect(json).toMatchObject({
      type: 'file',
      props: { name: 'test.js', content: 'var test = 1' },
      children: null
    });
  });

  test('should compile template from file', () => {
    const { toJSON } = render(
      <Template
        name="test.js"
        file={resolveFixture('template.tmpl')}
        data={{ foo: 'bar' }}
      />
    );
    const { props } = toJSON() as ReactTestRendererJSON;
    expect(props.name).toBe('test.js');
    expect(props.content.trim()).toBe('var foo = "bar"');
  });
});
