import transform from '../swc-transform';

const swc = async (
  code: string,
  { cssModuleFlag }: { cssModuleFlag: string } = { cssModuleFlag: '' }
) => {
  const options = {
    cssModuleFlag
  };

  return transform(code, options)!;
};

describe('auto-css-modules', () => {
  test('css modules', async () => {
    expect(await swc(`import styles from 'a.css';`)).toMatchInlineSnapshot(`
      "import styles from \\"a.css?cssmodules\\";
      "
    `);
    expect(await swc(`import styles from 'a.less';`)).toMatchInlineSnapshot(`
      "import styles from \\"a.less?cssmodules\\";
      "
    `);
    expect(await swc(`import styles from 'a.scss';`)).toMatchInlineSnapshot(`
      "import styles from \\"a.scss?cssmodules\\";
      "
    `);
    expect(await swc(`import styles from 'a.sass';`)).toMatchInlineSnapshot(`
      "import styles from \\"a.sass?cssmodules\\";
      "
    `);
  });

  test('css modules with flag', async () => {
    expect(
      await swc(`import styles from 'a.css';`, {
        cssModuleFlag: 'foo'
      })
    ).toMatchInlineSnapshot(`
      "import styles from \\"a.css?foo\\";
      "
    `);
  });

  test('no css modules', async () => {
    expect(await swc(`import 'a.css';`)).toMatchInlineSnapshot(`
      "import \\"a.css\\";
      "
    `);
  });

  test('do not infect non css imports', async () => {
    expect(await swc(`import a from 'a';`)).toMatchInlineSnapshot(`
      "import a from \\"a\\";
      "
    `);
    expect(await swc(`import a from 'a.js';`)).toMatchInlineSnapshot(`
      "import a from \\"a.js\\";
      "
    `);
    expect(await swc(`import 'a';`)).toMatchInlineSnapshot(`
      "import \\"a\\";
      "
    `);
  });
});
