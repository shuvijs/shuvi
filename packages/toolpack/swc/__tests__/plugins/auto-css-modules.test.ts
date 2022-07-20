import transform from '../swc-transform';

const swc = async (code: string, { flag }: { flag: string } = { flag: '' }) => {
  const filename = 'noop.js';

  const isTSFile = filename.endsWith('.ts');
  const isTypeScript = isTSFile || filename.endsWith('.tsx');
  const development = process.env.NODE_ENV === 'development';
  const jsc = {
    target: 'es2021',
    parser: {
      syntax: isTypeScript ? 'typescript' : 'ecmascript',
      dynamicImport: false,
      // Exclude regular TypeScript files from React transformation to prevent e.g. generic parameters and angle-bracket type assertion from being interpreted as JSX tags.
      [isTypeScript ? 'tsx' : 'jsx']: isTSFile ? false : true
    },

    transform: {
      react: {
        importSource: 'react',
        runtime: 'automatic',
        pragma: 'React.createElement',
        pragmaFrag: 'React.Fragment',
        throwIfNamespace: true,
        development,
        useBuiltins: true,
        refresh: false
      }
    }
  };

  const options = {
    disableShuviDynamic: false,
    minify: true,
    flag,
    jsc
  };

  return transform(code, options)!;
};

describe('auto-css-modules', () => {
  test('css modules', async () => {
    expect(await swc(`import styles from 'a.css';`)).toEqual(
      `import styles from\"a.css?cssmodules\"`
    );
    expect(await swc(`import styles from 'a.less';`)).toEqual(
      `import styles from\"a.less?cssmodules\"`
    );
    expect(await swc(`import styles from 'a.scss';`)).toEqual(
      `import styles from\"a.scss?cssmodules\"`
    );
    expect(await swc(`import styles from 'a.sass';`)).toEqual(
      `import styles from\"a.sass?cssmodules\"`
    );
  });

  test('css modules with flag', async () => {
    expect(
      await swc(`import styles from 'a.css';`, {
        flag: 'foo'
      })
    ).toEqual(`import styles from\"a.css?foo\"`);
  });

  test('no css modules', async () => {
    expect(await swc(`import 'a.css';`)).toEqual(`import\"a.css\"`);
  });

  test('do not infect non css imports', async () => {
    expect(await swc(`import a from 'a';`)).toEqual(`import a from\"a\"`);
    expect(await swc(`import a from 'a.js';`)).toEqual(`import a from\"a.js\"`);
    expect(await swc(`import 'a';`)).toEqual(`import\"a\"`);
  });
});
