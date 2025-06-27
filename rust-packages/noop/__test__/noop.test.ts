import { transform } from '@swc/core';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Noop Plugin', () => {
  it('should process code without modification when enabled', async () => {
    const input = readFileSync(
      join(__dirname, 'fixtures', 'noop.test.ts'),
      'utf-8'
    );

    const result = await transform(input, {
      jsc: {
        parser: {
          syntax: 'typescript',
          tsx: false
        },
        target: 'es2020',
        plugins: [['@shuvi/plugin-noop', { enable: true }]]
      },
      plugin: m => {
        // Load the plugin
        return require('./swc_plugin_noop.wasm');
      }
    });

    // The output should be identical to input since this is a noop plugin
    expect(result.code).toBe(input);
  });

  it('should not process code when disabled', async () => {
    const input = readFileSync(
      join(__dirname, 'fixtures', 'noop.test.ts'),
      'utf-8'
    );

    const result = await transform(input, {
      jsc: {
        parser: {
          syntax: 'typescript',
          tsx: false
        },
        target: 'es2020',
        plugins: [['@shuvi/plugin-noop', { enable: false }]]
      },
      plugin: m => {
        // Load the plugin
        return require('./swc_plugin_noop.wasm');
      }
    });

    // The output should be identical to input since this is a noop plugin
    expect(result.code).toBe(input);
  });

  it('should handle default configuration', async () => {
    const input = readFileSync(
      join(__dirname, 'fixtures', 'noop.test.ts'),
      'utf-8'
    );

    const result = await transform(input, {
      jsc: {
        parser: {
          syntax: 'typescript',
          tsx: false
        },
        target: 'es2020',
        plugins: [['@shuvi/plugin-noop']]
      },
      plugin: m => {
        // Load the plugin
        return require('./swc_plugin_noop.wasm');
      }
    });

    // The output should be identical to input since this is a noop plugin
    expect(result.code).toBe(input);
  });

  it('should handle simple JavaScript code', async () => {
    const input = `
      const message = "Hello, World!";
      console.log(message);
      
      function greet(name) {
        return \`Hello, \${name}!\`;
      }
      
      const result = greet("Alice");
      console.log(result);
    `;

    const result = await transform(input, {
      jsc: {
        parser: {
          syntax: 'ecmascript',
          jsx: false
        },
        target: 'es2020',
        plugins: [['@shuvi/plugin-noop', { enable: true }]]
      },
      plugin: m => {
        // Load the plugin
        return require('./swc_plugin_noop.wasm');
      }
    });

    // The output should be identical to input since this is a noop plugin
    expect(result.code).toBe(input);
  });
});
