import transform from '../swc-transform';
import { trim } from 'shuvi-test-utils';

const swc = async (code: string) => {
  const options = {};

  return transform(code, options)!;
};

describe('optimize-hook-destructuring', () => {
  it('should transform Array-destructured hook return values use object destructuring', async () => {
    const output = await swc(
      trim`
        import { useState } from 'react';
        const [count, setCount] = useState(0);
      `
    );

    expect(output).toMatchInlineSnapshot(`
      "import { useState } from \\"react\\";
      var ref = useState(0), count = ref[0], setCount = ref[1];
      "
    `);
  });

  it('should be able to ignore some Array-destructured hook return values', async () => {
    const output = await swc(
      trim`
        import { useState } from 'react';
        const [, setCount] = useState(0);
      `
    );

    expect(output).toMatchInlineSnapshot(`
      "import { useState } from \\"react\\";
      var ref = useState(0), setCount = ref[1];
      "
    `);
  });
});
