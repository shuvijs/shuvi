import { transform } from '@swc/core';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Auto CSS Modules Plugin', () => {
  const pluginPath = join(__dirname, '../swc_plugin_auto_css_modules.wasm');

  beforeAll(async () => {
    // Ensure the plugin is built
    try {
      readFileSync(pluginPath);
    } catch {
      throw new Error(
        `Plugin not found at ${pluginPath}. Please run 'pnpm run build:debug' first.`
      );
    }
  });

  describe('Basic CSS Modules Transformation', () => {
    it('should transform named CSS imports with default flag', async () => {
      const code = `
import styles from 'a.css';
import styles from 'a.less';
import styles from 'a.scss';
import styles from 'a.sass';
`;

      const result = await transform(code, {
        filename: 'test.js',
        plugins: [
          [
            pluginPath,
            {
              cssModuleFlag: 'cssmodules'
            }
          ]
        ]
      });

      expect(result.code).toContain("import styles from 'a.css?cssmodules';");
      expect(result.code).toContain("import styles from 'a.less?cssmodules';");
      expect(result.code).toContain("import styles from 'a.scss?cssmodules';");
      expect(result.code).toContain("import styles from 'a.sass?cssmodules';");
    });
  });

  describe('Custom CSS Module Flag', () => {
    it('should use custom flag when provided', async () => {
      const code = `import styles from 'a.css';`;

      const result = await transform(code, {
        filename: 'test.js',
        plugins: [
          [
            pluginPath,
            {
              cssModuleFlag: 'foo'
            }
          ]
        ]
      });

      expect(result.code).toContain("import styles from 'a.css?foo';");
    });
  });

  describe('Side-effect CSS Imports', () => {
    it('should not transform side-effect imports', async () => {
      const code = `import 'a.css';`;

      const result = await transform(code, {
        filename: 'test.js',
        plugins: [
          [
            pluginPath,
            {
              cssModuleFlag: 'cssmodules'
            }
          ]
        ]
      });

      expect(result.code).toContain("import 'a.css';");
      expect(result.code).not.toContain("import 'a.css?cssmodules';");
    });
  });

  describe('Non-CSS Imports', () => {
    it('should not transform non-CSS imports', async () => {
      const code = `
import a from 'a';
import a from 'a.js';
import 'a';
`;

      const result = await transform(code, {
        filename: 'test.js',
        plugins: [
          [
            pluginPath,
            {
              cssModuleFlag: 'cssmodules'
            }
          ]
        ]
      });

      expect(result.code).toContain("import a from 'a';");
      expect(result.code).toContain("import a from 'a.js';");
      expect(result.code).toContain("import 'a';");
      expect(result.code).not.toContain('?cssmodules');
    });
  });

  describe('Dynamic Imports', () => {
    it('should transform dynamic CSS imports', async () => {
      const code = `import('a.css').then(module => {});`;

      const result = await transform(code, {
        filename: 'test.js',
        plugins: [
          [
            pluginPath,
            {
              cssModuleFlag: 'cssmodules'
            }
          ]
        ]
      });

      expect(result.code).toContain(
        "import('a.css?cssmodules').then(module => {});"
      );
    });

    it('should not transform dynamic non-CSS imports', async () => {
      const code = `import('a.js').then(module => {});`;

      const result = await transform(code, {
        filename: 'test.js',
        plugins: [
          [
            pluginPath,
            {
              cssModuleFlag: 'cssmodules'
            }
          ]
        ]
      });

      expect(result.code).toContain("import('a.js').then(module => {});");
      expect(result.code).not.toContain('?cssmodules');
    });
  });

  describe('Mixed Imports', () => {
    it('should handle mixed import types correctly', async () => {
      const code = `
import styles from 'a.css';
import 'b.css';
import other from 'c.js';
import('d.css');
import('e.js');
`;

      const result = await transform(code, {
        filename: 'test.js',
        plugins: [
          [
            pluginPath,
            {
              cssModuleFlag: 'cssmodules'
            }
          ]
        ]
      });

      // Should transform named CSS imports
      expect(result.code).toContain("import styles from 'a.css?cssmodules';");

      // Should not transform side-effect CSS imports
      expect(result.code).toContain("import 'b.css';");

      // Should not transform non-CSS imports
      expect(result.code).toContain("import other from 'c.js';");

      // Should transform dynamic CSS imports
      expect(result.code).toContain("import('d.css?cssmodules');");

      // Should not transform dynamic non-CSS imports
      expect(result.code).toContain("import('e.js');");
    });
  });

  describe('Default Configuration', () => {
    it('should use default cssModuleFlag when no config provided', async () => {
      const code = `import styles from 'a.css';`;

      const result = await transform(code, {
        filename: 'test.js',
        plugins: [[pluginPath]]
      });

      expect(result.code).toContain("import styles from 'a.css?cssmodules';");
    });
  });
});
