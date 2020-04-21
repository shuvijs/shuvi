import { transform } from '@babel/core';
import { IOpts } from '../auto-css-modules';

function babel(code: string, opts: IOpts = {}) {
  return transform(code, {
    filename: 'noop.js',
    plugins: [[require.resolve('../auto-css-modules'), opts]],
  })!.code;
}

describe('auto-css-modules', () => {
  test('css modules', () => {
    expect(babel(`import styles from 'a.css';`)).toEqual(
      `import styles from "a.css?cssmodules";`
    );
    expect(babel(`import styles from 'a.less';`)).toEqual(
      `import styles from "a.less?cssmodules";`
    );
    expect(babel(`import styles from 'a.scss';`)).toEqual(
      `import styles from "a.scss?cssmodules";`
    );
    expect(babel(`import styles from 'a.sass';`)).toEqual(
      `import styles from "a.sass?cssmodules";`
    );
  });

  test('css modules with flag', () => {
    expect(
      babel(`import styles from 'a.css';`, {
        flag: 'foo',
      })
    ).toEqual(`import styles from "a.css?foo";`);
  });

  test('no css modules', () => {
    expect(babel(`import 'a.css';`)).toEqual(`import 'a.css';`);
  });

  test('do not infect non css imports', () => {
    expect(babel(`import a from 'a';`)).toEqual(`import a from 'a';`);
    expect(babel(`import a from 'a.js';`)).toEqual(`import a from 'a.js';`);
    expect(babel(`import 'a';`)).toEqual(`import 'a';`);
  });
});
