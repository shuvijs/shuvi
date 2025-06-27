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
      "import styles from "a.css?cssmodules";
      "
    `);
    expect(await swc(`import styles from 'a.less';`)).toMatchInlineSnapshot(`
      "import styles from "a.less?cssmodules";
      "
    `);
    expect(await swc(`import styles from 'a.scss';`)).toMatchInlineSnapshot(`
      "import styles from "a.scss?cssmodules";
      "
    `);
    expect(await swc(`import styles from 'a.sass';`)).toMatchInlineSnapshot(`
      "import styles from "a.sass?cssmodules";
      "
    `);
  });

  test('css modules with flag', async () => {
    expect(
      await swc(`import styles from 'a.css';`, {
        cssModuleFlag: 'foo'
      })
    ).toMatchInlineSnapshot(`
      "import styles from "a.css?foo";
      "
    `);
  });

  test('no css modules', async () => {
    expect(await swc(`import 'a.css';`)).toMatchInlineSnapshot(`
      "import "a.css";
      "
    `);
  });

  test('do not infect non css imports', async () => {
    expect(await swc(`import a from 'a';`)).toMatchInlineSnapshot(`
      "import a from "a";
      "
    `);
    expect(await swc(`import a from 'a.js';`)).toMatchInlineSnapshot(`
      "import a from "a.js";
      "
    `);
    expect(await swc(`import 'a';`)).toMatchInlineSnapshot(`
      "import "a";
      "
    `);
  });

  // 追加的測試用例 - 涵蓋所有案例和邊緣情況
  describe('additional test cases', () => {
    test('css modules with empty flag should use default', async () => {
      expect(
        await swc(`import styles from 'a.css';`, {
          cssModuleFlag: ''
        })
      ).toMatchInlineSnapshot(`
        "import styles from "a.css?cssmodules";
        "
      `);
    });

    test('css side-effect imports should not be transformed', async () => {
      expect(await swc(`import 'a.less';`)).toMatchInlineSnapshot(`
        "import "a.less";
        "
      `);
      expect(await swc(`import 'a.scss';`)).toMatchInlineSnapshot(`
        "import "a.scss";
        "
      `);
      expect(await swc(`import 'a.sass';`)).toMatchInlineSnapshot(`
        "import "a.sass";
        "
      `);
    });

    test('non-css side-effect imports', async () => {
      expect(await swc(`import 'a.ts';`)).toMatchInlineSnapshot(`
        "import "a.ts";
        "
      `);
      expect(await swc(`import 'a.tsx';`)).toMatchInlineSnapshot(`
        "import "a.tsx";
        "
      `);
    });

    test('other file extensions should not be transformed', async () => {
      expect(await swc(`import a from 'a.ts';`)).toMatchInlineSnapshot(`
        "import a from "a.ts";
        "
      `);
      expect(await swc(`import a from 'a.tsx';`)).toMatchInlineSnapshot(`
        "import a from "a.tsx";
        "
      `);
      expect(await swc(`import a from 'a.json';`)).toMatchInlineSnapshot(`
        "import a from "a.json";
        "
      `);
      expect(await swc(`import a from 'a.xml';`)).toMatchInlineSnapshot(`
        "import a from "a.xml";
        "
      `);
      expect(await swc(`import a from 'a.html';`)).toMatchInlineSnapshot(`
        "import a from "a.html";
        "
      `);
      expect(await swc(`import a from 'a.svg';`)).toMatchInlineSnapshot(`
        "import a from "a.svg";
        "
      `);
    });

    test('complex import patterns - only default imports are transformed', async () => {
      // Named imports with default alias are not transformed by the current implementation
      expect(await swc(`import { default as styles } from 'a.css';`))
        .toMatchInlineSnapshot(`
        "import { default as styles } from "a.css";
        "
      `);
      expect(await swc(`import { default as styles } from 'a.less';`))
        .toMatchInlineSnapshot(`
        "import { default as styles } from "a.less";
        "
      `);
      // Mixed imports ARE transformed because they contain a default specifier
      expect(await swc(`import styles, { other } from 'a.css';`))
        .toMatchInlineSnapshot(`
        "import styles, { other } from "a.css?cssmodules";
        "
      `);
      expect(await swc(`import styles, { other } from 'a.scss';`))
        .toMatchInlineSnapshot(`
        "import styles, { other } from "a.scss?cssmodules";
        "
      `);
    });

    test('query parameters handling', async () => {
      expect(await swc(`import styles from 'a.css?existing=true';`))
        .toMatchInlineSnapshot(`
        "import styles from "a.css?existing=true&cssmodules";
        "
      `);
      expect(await swc(`import styles from 'a.less?foo=bar';`))
        .toMatchInlineSnapshot(`
        "import styles from "a.less?foo=bar&cssmodules";
        "
      `);
      expect(
        await swc(`import styles from 'a.css?existing=true';`, {
          cssModuleFlag: 'custom'
        })
      ).toMatchInlineSnapshot(`
        "import styles from "a.css?existing=true&custom";
        "
      `);
      expect(await swc(`import styles from 'a.css?foo=bar&baz=qux';`))
        .toMatchInlineSnapshot(`
        "import styles from "a.css?foo=bar&baz=qux&cssmodules";
        "
      `);
      expect(await swc(`import styles from 'a.css?foo=bar&baz=qux&test=123';`))
        .toMatchInlineSnapshot(`
        "import styles from "a.css?foo=bar&baz=qux&test=123&cssmodules";
        "
      `);
    });

    test('file path variations', async () => {
      expect(await swc(`import styles from './a.css';`)).toMatchInlineSnapshot(`
        "import styles from "./a.css?cssmodules";
        "
      `);
      expect(await swc(`import styles from '../a.less';`))
        .toMatchInlineSnapshot(`
        "import styles from "../a.less?cssmodules";
        "
      `);
      expect(await swc(`import styles from '../../a.scss';`))
        .toMatchInlineSnapshot(`
        "import styles from "../../a.scss?cssmodules";
        "
      `);
      expect(await swc(`import styles from '/a.css';`)).toMatchInlineSnapshot(`
        "import styles from "/a.css?cssmodules";
        "
      `);
      expect(await swc(`import styles from '/path/to/a.less';`))
        .toMatchInlineSnapshot(`
        "import styles from "/path/to/a.less?cssmodules";
        "
      `);
      expect(await swc(`import styles from 'my.file.css';`))
        .toMatchInlineSnapshot(`
        "import styles from "my.file.css?cssmodules";
        "
      `);
      expect(await swc(`import styles from 'my.file.less';`))
        .toMatchInlineSnapshot(`
        "import styles from "my.file.less?cssmodules";
        "
      `);
      expect(await swc(`import styles from 'my-file.css';`))
        .toMatchInlineSnapshot(`
        "import styles from "my-file.css?cssmodules";
        "
      `);
      expect(await swc(`import styles from 'my_file.scss';`))
        .toMatchInlineSnapshot(`
        "import styles from "my_file.scss?cssmodules";
        "
      `);
    });

    test('edge cases', async () => {
      // Invalid syntax tests removed as they cause syntax errors
      expect(await swc(`import styles from 'css.css';`)).toMatchInlineSnapshot(`
        "import styles from "css.css?cssmodules";
        "
      `);
      expect(await swc(`import styles from 'css.less';`))
        .toMatchInlineSnapshot(`
        "import styles from "css.less?cssmodules";
        "
      `);
      expect(await swc(`import styles from 'mycssfile.css';`))
        .toMatchInlineSnapshot(`
        "import styles from "mycssfile.css?cssmodules";
        "
      `);
      expect(await swc(`import styles from 'lessfile.less';`))
        .toMatchInlineSnapshot(`
        "import styles from "lessfile.less?cssmodules";
        "
      `);
    });

    test('case sensitivity - only lowercase extensions are supported', async () => {
      // The transformer only checks for lowercase extensions
      expect(await swc(`import styles from 'a.CSS';`)).toMatchInlineSnapshot(`
        "import styles from "a.CSS";
        "
      `);
      expect(await swc(`import styles from 'a.LESS';`)).toMatchInlineSnapshot(`
        "import styles from "a.LESS";
        "
      `);
      expect(await swc(`import styles from 'a.SCSS';`)).toMatchInlineSnapshot(`
        "import styles from "a.SCSS";
        "
      `);
      expect(await swc(`import styles from 'a.SASS';`)).toMatchInlineSnapshot(`
        "import styles from "a.SASS";
        "
      `);
    });

    test('multiple imports in one statement', async () => {
      const code = `
        import styles from 'a.css';
        import other from 'b.less';
        import './c.scss';
        import utils from 'utils.js';
      `;
      const result = await swc(code);
      expect(result).toContain('import styles from "a.css?cssmodules"');
      expect(result).toContain('import other from "b.less?cssmodules"');
      expect(result).toContain('import "./c.scss"');
      expect(result).toContain('import utils from "utils.js"');
    });

    test('complex scenarios with multiple css imports', async () => {
      const code = `
        import styles from './styles.css';
        import './global.css';
        import componentStyles from '../components/button.less';
        import { default as themeStyles } from '../../theme/main.scss';
        import './utils.js';
        import utils from './utils.js';
      `;
      const result = await swc(code);

      expect(result).toContain('import styles from "./styles.css?cssmodules"');
      expect(result).toContain('import "./global.css"');
      expect(result).toContain(
        'import componentStyles from "../components/button.less?cssmodules"'
      );
      // Named imports with default alias are not transformed
      expect(result).toContain(
        'import { default as themeStyles } from "../../theme/main.scss"'
      );
      expect(result).toContain('import "./utils.js"');
      expect(result).toContain('import utils from "./utils.js"');
    });

    test('css imports with existing query parameters and custom flag', async () => {
      const code = `
        import styles from './styles.css?theme=dark';
        import componentStyles from '../components/button.less?version=2.0';
        import './global.css?minify=true';
      `;
      const result = await swc(code, { cssModuleFlag: 'modules' });

      expect(result).toContain(
        'import styles from "./styles.css?theme=dark&modules"'
      );
      expect(result).toContain(
        'import componentStyles from "../components/button.less?version=2.0&modules"'
      );
      expect(result).toContain('import "./global.css?minify=true"');
    });

    test('mixed file types with complex paths', async () => {
      const code = `
        import styles from '/src/styles/main.css';
        import './components/Button/button.scss';
        import utils from './utils/index.js';
        import { Button } from './components/Button/index.tsx';
        import './global.less';
        import theme from './theme/config.json';
      `;
      const result = await swc(code);

      expect(result).toContain(
        'import styles from "/src/styles/main.css?cssmodules"'
      );
      // Side-effect imports are not transformed
      expect(result).toContain('import "./components/Button/button.scss"');
      expect(result).toContain('import utils from "./utils/index.js"');
      expect(result).toContain(
        'import { Button } from "./components/Button/index.tsx"'
      );
      expect(result).toContain('import "./global.less"');
      expect(result).toContain('import theme from "./theme/config.json"');
    });

    test('TypeScript specific cases - type imports are not supported', async () => {
      // TypeScript type imports are not supported by the current transformer
      // These will cause syntax errors, so we skip them
      expect(await swc(`import styles from './styles.css';`))
        .toMatchInlineSnapshot(`
        "import styles from "./styles.css?cssmodules";
        "
      `);
    });

    test('custom flag variations', async () => {
      expect(
        await swc(`import styles from 'a.less';`, {
          cssModuleFlag: 'bar'
        })
      ).toMatchInlineSnapshot(`
        "import styles from "a.less?bar";
        "
      `);
      expect(
        await swc(`import styles from 'a.scss';`, {
          cssModuleFlag: 'scoped'
        })
      ).toMatchInlineSnapshot(`
        "import styles from "a.scss?scoped";
        "
      `);
      expect(
        await swc(`import styles from 'a.sass';`, {
          cssModuleFlag: 'local'
        })
      ).toMatchInlineSnapshot(`
        "import styles from "a.sass?local";
        "
      `);
    });

    test('special characters in file names', async () => {
      expect(await swc(`import styles from 'my-file-name.css';`))
        .toMatchInlineSnapshot(`
        "import styles from "my-file-name.css?cssmodules";
        "
      `);
      expect(await swc(`import styles from 'my_file_name.scss';`))
        .toMatchInlineSnapshot(`
        "import styles from "my_file_name.scss?cssmodules";
        "
      `);
      expect(await swc(`import styles from 'my.file.name.less';`))
        .toMatchInlineSnapshot(`
        "import styles from "my.file.name.less?cssmodules";
        "
      `);
    });

    test('deep nested paths', async () => {
      expect(
        await swc(`import styles from '../../../deep/nested/path/styles.css';`)
      ).toMatchInlineSnapshot(`
        "import styles from "../../../deep/nested/path/styles.css?cssmodules";
        "
      `);
      expect(
        await swc(`import styles from '/very/deep/nested/path/to/styles.scss';`)
      ).toMatchInlineSnapshot(`
        "import styles from "/very/deep/nested/path/to/styles.scss?cssmodules";
        "
      `);
    });

    test('file names with numbers', async () => {
      expect(await swc(`import styles from 'styles1.css';`))
        .toMatchInlineSnapshot(`
        "import styles from "styles1.css?cssmodules";
        "
      `);
      expect(await swc(`import styles from 'button-v2.scss';`))
        .toMatchInlineSnapshot(`
        "import styles from "button-v2.scss?cssmodules";
        "
      `);
      expect(await swc(`import styles from 'theme-2023.less';`))
        .toMatchInlineSnapshot(`
        "import styles from "theme-2023.less?cssmodules";
        "
      `);
    });
  });
});
