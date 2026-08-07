import transform from '../swc-transform';

const swc = async (code: string) => {
  const options = {};

  return transform(code, options)!;
};

describe('optimize-hook-destructuring', () => {
  it('should transform Array-destructured hook return values use object destructuring', async () => {
    const output = await swc(
      `
        import { useState } from 'react';
        const [count, setCount] = useState(0);
      `
    );

    expect(output).toMatchInlineSnapshot(`
      "import { useState } from "react";
      var _useState = useState(0), count = _useState[0], setCount = _useState[1];
      "
    `);
  });

  it('should be able to ignore some Array-destructured hook return values', async () => {
    const output = await swc(
      `
        import { useState } from 'react';
        const [, setCount] = useState(0);
      `
    );

    expect(output).toMatchInlineSnapshot(`
      "import { useState } from "react";
      var _useState = useState(0), setCount = _useState[1];
      "
    `);
  });
});
