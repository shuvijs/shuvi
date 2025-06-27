import { rspack } from '@rspack/core';
import path from 'path';
import fs from 'fs';

// Helper function to create a test file with the given import code
const createTestFile = (importCode: string) => {
  return `${importCode}`;
};

// Test if we can load the WASM file directly
const testWasmLoad = async () => {
  const wasmPath = path.resolve(
    __dirname,
    './swc-plugin-auto-css-modules/target/wasm32-unknown-unknown/release/swc_plugin_example.wasm'
  );
  console.log('Testing WASM load...');
  console.log('WASM path:', wasmPath);
  console.log('WASM exists:', fs.existsSync(wasmPath));

  try {
    // Try to read the WASM file
    const wasmBuffer = fs.readFileSync(wasmPath);
    console.log('WASM file size:', wasmBuffer.length, 'bytes');
    console.log('WASM file first 32 bytes:', wasmBuffer.slice(0, 32));
    return true;
  } catch (error) {
    console.error('Error reading WASM file:', error);
    return false;
  }
};

const swc = async (
  code: string,
  { cssModuleFlag }: { cssModuleFlag: string } = {
    cssModuleFlag: 'css-modules'
  }
) => {
  // Test WASM loading first
  const wasmLoaded = await testWasmLoad();
  if (!wasmLoaded) {
    throw new Error('Failed to load WASM file');
  }

  // Create a temporary file with the test code
  const tmpDir = path.resolve(__dirname, '../temp');
  // Ensure temp directory exists
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }

  // Generate a predictable filename based on the input code
  const codeHash = Buffer.from(code)
    .toString('base64')
    .replace(/[^a-zA-Z0-9]/g, '')
    .substring(0, 8);
  const testFile = path.join(tmpDir, `test-${codeHash}.js`);
  const testCode = createTestFile(code);
  fs.writeFileSync(testFile, testCode);

  console.log('Test file created:', testFile);
  console.log('Test file content:', testCode);

  // Create mock CSS files for testing
  const cssFiles = ['a.css', 'a.less', 'a.scss', 'a.sass'];
  cssFiles.forEach(cssFile => {
    const cssPath = path.join(tmpDir, cssFile);
    if (!fs.existsSync(cssPath)) {
      fs.writeFileSync(cssPath, '/* mock css file */');
    }
  });

  const wasmPath = path.resolve(
    __dirname,
    './swc-plugin-auto-css-modules/target/wasm32-unknown-unknown/release/swc_plugin_example.wasm'
  );
  console.log('WASM path:', wasmPath);
  console.log('WASM exists:', fs.existsSync(wasmPath));

  // Try a different configuration approach
  const config = {
    context: tmpDir,
    entry: './' + path.basename(testFile),
    resolve: {
      preferRelative: true,
      modules: [tmpDir, 'node_modules']
    },
    output: {
      path: path.join(tmpDir, 'dist'),
      filename: path.basename(testFile, '.js') + '.bundle.js',
      library: {
        type: 'module'
      }
    },
    experiments: {
      outputModule: true
    },
    module: {
      rules: [
        {
          test: /\.(js|ts|tsx)$/,
          exclude: [/node_modules/],
          use: {
            loader: 'builtin:swc-loader',
            options: {
              jsc: {
                parser: {
                  syntax: 'ecmascript',
                  jsx: false
                },
                experimental: {
                  plugins: [[wasmPath, { cssModuleFlag }]]
                }
              }
            }
          },
          type: 'javascript/auto'
        },
        {
          test: /\.(css|less|scss|sass)$/,
          type: 'asset/resource'
        }
      ]
    },
    infrastructureLogging: {
      level: 'verbose' as const
    }
  };

  console.log('Rspack config:', JSON.stringify(config, null, 2));

  // Run Rspack build
  const compiler = rspack(config);

  return new Promise<string>((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) {
        console.error('Rspack error:', err);
        reject(err);
        return;
      }

      if (stats?.hasErrors()) {
        console.error('Rspack stats errors:', stats.toString());
        reject(new Error(stats.toString()));
        return;
      }

      console.log('Rspack build completed successfully');
      console.log('Rspack stats:', stats?.toString());

      // Check if there are any warnings about plugin loading
      if (stats?.hasWarnings()) {
        console.log('Rspack warnings:', stats.toString());
      }

      try {
        // Read the transformed bundle
        const bundlePath = path.join(
          tmpDir,
          'dist',
          path.basename(testFile, '.js') + '.bundle.js'
        );
        const bundleContent = fs.readFileSync(bundlePath, 'utf-8');

        console.log('Bundle path:', bundlePath);
        console.log('Bundle exists:', fs.existsSync(bundlePath));
        console.log('Bundle content:', bundleContent);

        // Try to find the original import in the bundle
        const originalImportMatch = bundleContent.match(
          /import\s+.*?from\s+['"`]([^'"`]+)['"`]/
        );
        if (originalImportMatch) {
          console.log('Found original import:', originalImportMatch[0]);
          console.log('Original import path:', originalImportMatch[1]);

          // Check if the path was transformed
          if (originalImportMatch[1].includes('?')) {
            console.log('Import was transformed!');
            const importStatement = code.replace(
              /from\s+['"`]([^'"`]+)['"`]/,
              `from "${originalImportMatch[1]}"`
            );
            console.log('Final import statement:', importStatement);
            resolve(importStatement);
          } else {
            console.log('Import was NOT transformed');
            resolve(code);
          }
        } else {
          // If no import found, return the original code
          console.log(
            'No import match found in bundle, returning original code'
          );
          resolve(code);
        }
      } catch (error) {
        console.error('Error reading bundle:', error);
        reject(error);
      } finally {
        // Clean up temporary files
        try {
          fs.unlinkSync(testFile);
          fs.rmSync(path.join(tmpDir, 'dist'), {
            recursive: true,
            force: true
          });
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    });
  });
};

describe('auto-css-modules', () => {
  test('css modules', async () => {
    expect(await swc(`import styles from 'a.css';`)).toMatchInlineSnapshot(`
      "import styles from 'a.css?css-modules';"
    `);
  });

  test('less modules', async () => {
    expect(await swc(`import styles from 'a.less';`)).toMatchInlineSnapshot(`
      "import styles from 'a.less?css-modules';"
    `);
  });

  test('scss modules', async () => {
    expect(await swc(`import styles from 'a.scss';`)).toMatchInlineSnapshot(`
      "import styles from 'a.scss?css-modules';"
    `);
  });

  test('sass modules', async () => {
    expect(await swc(`import styles from 'a.sass';`)).toMatchInlineSnapshot(`
      "import styles from 'a.sass?css-modules';"
    `);
  });

  test('non-css import should not be transformed', async () => {
    expect(await swc(`import React from 'react';`)).toMatchInlineSnapshot(`
      "import React from 'react';"
    `);
  });
});
