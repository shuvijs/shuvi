import { transform } from '@babel/core';
import { trim } from 'shuvi-test-utils/shared';

function babel(code: string) {
  return transform(code, {
    filename: 'noop.js',
    plugins: [
      [
        require.resolve('../optimize-hook-destructuring'),
        {
          lib: true
        }
      ]
    ],
    babelrc: false,
    configFile: false,
    sourceType: 'module',
    compact: true
  })!.code;
}

describe('optimize-hook-destructuring', () => {
  it('should transform Array-destructured hook return values use object destructuring', () => {
    const output = babel(
      trim`
        import { useState } from 'react';
        const [count, setCount] = useState(0);
      `
    );

    expect(output).toMatchInlineSnapshot(
      `"import{useState}from'react';const{0:count,1:setCount}=useState(0);"`
    );
  });

  it('should be able to ignore some Array-destructured hook return values', () => {
    const output = babel(
      trim`
        import { useState } from 'react';
        const [, setCount] = useState(0);
      `
    );

    expect(output).toMatchInlineSnapshot(
      `"import{useState}from'react';const{1:setCount}=useState(0);"`
    );
  });
});
