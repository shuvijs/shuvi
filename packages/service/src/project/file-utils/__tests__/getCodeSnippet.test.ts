import { getCodeSnippet } from '../getCodeSnippet';
import { trim } from 'shuvi-test-utils';

describe('collectDeps', () => {
  test('should work', () => {
    const result = getCodeSnippet(trim`
    const add = (a, b) => a + b
  `);

    expect(result.imports).toBe('');
    expect(result.body).toBe(trim`
    const add = (a, b) => a + b;
  `);
  });

  test('should split single import and code', () => {
    const result = getCodeSnippet(trim`
    import React from 'react'
    const Hello = () => <div>hello</div>
  `);

    expect(result.imports).toBe(`import React from 'react';`);
    expect(result.body).toBe(trim`const Hello = () => <div>hello</div>;`);
  });

  test('should split multiple imports and multiple code', () => {
    const result = getCodeSnippet(trim`
    import React from 'react'
    import _ from 'lodash'
    const Hello = () => <div>hello</div>
    document.write('hello')
  `);

    expect(result.imports).toEqual(
      [`import React from 'react';`, `import _ from 'lodash';`].join('\n')
    );
    expect(result.body.split('\n').filter(s => Boolean(s))).toEqual([
      `const Hello = () => <div>hello</div>;`,
      `document.write('hello');`
    ]);
  });
});
