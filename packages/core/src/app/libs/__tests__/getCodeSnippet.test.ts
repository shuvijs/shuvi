import { getCodeSnippet } from '../getCodeSnippet';
import { trim } from 'shuvi-test-utils';

describe('collectDeps', () => {
  test('should work', () => {
    const result = getCodeSnippet(trim`
    const add = (a, b) => a + b
  `);

    expect(result.imports).toBe('');
    expect(result.body).toBe(trim`
    const add = (a, b) => a + b
  `);
  });

  test('should split imports and code', () => {
    const result = getCodeSnippet(trim`
    import React from 'react'
    //@code
    const Hello = () => <div>hello</div>
  `);

    expect(result.imports).toBe(`import React from 'react'`);
    expect(result.body).toBe(trim`const Hello = () => <div>hello</div>`);
  });
});
