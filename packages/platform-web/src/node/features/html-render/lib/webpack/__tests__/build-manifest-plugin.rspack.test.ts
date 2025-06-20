/**
 * @fileoverview
 * Unit tests for BuildManifestPlugin. Covers default, advanced, edge, and instantiation scenarios.
 */
import BuildManifestPlugin from '../build-manifest-plugin.rspack';
import { createCompiler } from './helpers/rspack';
import { resolveFixture } from './utils';

const entry = resolveFixture('manifest');

/**
 * Test suite for BuildManifestPlugin covering all major behaviors and edge cases.
 */
describe('BuildManifestPlugin', () => {
  /**
   * Tests for basic plugin functionality with default and custom options.
   */
  describe('basic functionality', () => {
    /**
     * Should generate a manifest with default options (default filename, no modules/chunkRequest).
     * Verifies the basic output structure for a standard entry.
     */
    test('should generate manifest with default options', done => {
      expect.assertions(1);
      const compiler = createCompiler({
        entry: entry,
        optimization: {
          runtimeChunk: {
            name: 'runtime'
          }
        },
        plugins: [
          new BuildManifestPlugin({
            filename: 'build-manifest.json'
          })
        ]
      });

      compiler.hooks.emit.tap('test', compilation => {
        const manifest = JSON.parse(
          compilation.assets['build-manifest.json'].source().toString()
        );

        expect(manifest).toMatchObject({
          polyfillFiles: [],
          entries: {
            main: {
              js: ['runtime.js', 'main.js']
            }
          },
          bundles: {
            main: 'main.js',
            runtime: 'runtime.js'
          },
          chunkRequest: {},
          loadble: {}
        });
      });

      compiler.run(done);
    });

    /**
     * Should generate a manifest with a custom filename.
     * Ensures the plugin respects the filename option and outputs the correct structure.
     */
    test('should generate manifest with custom filename', done => {
      expect.assertions(2);
      const customFilename = 'custom-manifest.json';
      const compiler = createCompiler({
        entry: entry,
        optimization: {
          runtimeChunk: {
            name: 'runtime'
          }
        },
        plugins: [
          new BuildManifestPlugin({
            filename: customFilename
          })
        ]
      });

      compiler.hooks.emit.tap('test', compilation => {
        expect(compilation.assets[customFilename]).toBeDefined();
        const manifest = JSON.parse(
          compilation.assets[customFilename].source().toString()
        );

        expect(manifest).toMatchObject({
          polyfillFiles: [],
          entries: {
            main: {
              js: ['runtime.js', 'main.js']
            }
          },
          bundles: {
            main: 'main.js',
            runtime: 'runtime.js'
          },
          chunkRequest: {},
          loadble: {}
        });
      });

      compiler.run(done);
    });
  });

  /**
   * Tests for advanced plugin options: modules and chunkRequest.
   * Covers all combinations of these options.
   */
  describe('advanced options', () => {
    /**
     * Should include both modules and chunkRequest in the manifest when both options are enabled.
     * Validates the output structure for maximum plugin detail.
     */
    test('should include modules and chunkRequest when enabled', done => {
      expect.assertions(1);
      const compiler = createCompiler({
        entry: entry,
        optimization: {
          runtimeChunk: {
            name: 'runtime'
          }
        },
        plugins: [
          new BuildManifestPlugin({
            filename: 'build-manifest.json',
            modules: true,
            chunkRequest: true
          })
        ]
      });

      compiler.hooks.emit.tap('test', compilation => {
        const manifest = JSON.parse(
          compilation.assets['build-manifest.json'].source().toString()
        );

        expect(manifest).toMatchObject({
          polyfillFiles: [],
          entries: {
            main: {
              js: ['runtime.js', 'main.js']
            }
          },
          bundles: {
            main: 'main.js',
            runtime: 'runtime.js'
          },
          chunkRequest: {
            'static/chunks/helperOne.js': './shared/one',
            'static/chunks/helperTwo.js': './shared/two',
            'main.js': entry,
            'runtime.js': entry
          },
          loadble: {
            './shared/one': {
              children: [
                {
                  id: expect.stringContaining('shared/one.js'),
                  name: expect.stringContaining('shared/one.js')
                }
              ],
              files: ['static/chunks/helperOne.js']
            },
            './shared/two': {
              children: [
                {
                  id: expect.stringContaining('shared/two.js'),
                  name: expect.stringContaining('shared/two.js')
                }
              ],
              files: ['static/chunks/helperTwo.js']
            }
          }
        });
      });

      compiler.run(done);
    });

    /**
     * Should include only modules in the manifest when modules=true and chunkRequest=false.
     * Ensures chunkRequest is omitted and modules are present.
     */
    test('should include only modules when modules=true and chunkRequest=false', done => {
      expect.assertions(1);
      const compiler = createCompiler({
        entry: entry,
        optimization: {
          runtimeChunk: {
            name: 'runtime'
          }
        },
        plugins: [
          new BuildManifestPlugin({
            filename: 'build-manifest.json',
            modules: true,
            chunkRequest: false
          })
        ]
      });

      compiler.hooks.emit.tap('test', compilation => {
        const manifest = JSON.parse(
          compilation.assets['build-manifest.json'].source().toString()
        );

        expect(manifest).toMatchObject({
          polyfillFiles: [],
          entries: {
            main: {
              js: ['runtime.js', 'main.js']
            }
          },
          bundles: {
            main: 'main.js',
            runtime: 'runtime.js'
          },
          chunkRequest: {},
          loadble: {
            './shared/one': {
              children: [
                {
                  id: expect.stringContaining('shared/one.js'),
                  name: expect.stringContaining('shared/one.js')
                }
              ],
              files: ['static/chunks/helperOne.js']
            },
            './shared/two': {
              children: [
                {
                  id: expect.stringContaining('shared/two.js'),
                  name: expect.stringContaining('shared/two.js')
                }
              ],
              files: ['static/chunks/helperTwo.js']
            }
          }
        });
      });

      compiler.run(done);
    });

    /**
     * Should include only chunkRequest in the manifest when modules=false and chunkRequest=true.
     * Ensures modules are omitted and chunkRequest is present.
     */
    test('should include only chunkRequest when modules=false and chunkRequest=true', done => {
      expect.assertions(1);
      const compiler = createCompiler({
        entry: entry,
        optimization: {
          runtimeChunk: {
            name: 'runtime'
          }
        },
        plugins: [
          new BuildManifestPlugin({
            filename: 'build-manifest.json',
            modules: false,
            chunkRequest: true
          })
        ]
      });

      compiler.hooks.emit.tap('test', compilation => {
        const manifest = JSON.parse(
          compilation.assets['build-manifest.json'].source().toString()
        );

        expect(manifest).toMatchObject({
          polyfillFiles: [],
          entries: {
            main: {
              js: ['runtime.js', 'main.js']
            }
          },
          bundles: {
            main: 'main.js',
            runtime: 'runtime.js'
          },
          chunkRequest: {
            'static/chunks/helperOne.js': './shared/one',
            'static/chunks/helperTwo.js': './shared/two',
            'main.js': entry,
            'runtime.js': entry
          },
          loadble: {}
        });
      });

      compiler.run(done);
    });
  });

  /**
   * Tests for edge cases such as empty entries, multiple entries, and custom runtime chunk names.
   */
  describe('edge cases', () => {
    /**
     * Should handle an empty entry object gracefully.
     * Ensures the manifest is still valid and empty.
     */
    test('should handle empty entry points gracefully', done => {
      expect.assertions(1);
      const compiler = createCompiler({
        entry: {},
        plugins: [
          new BuildManifestPlugin({
            filename: 'build-manifest.json'
          })
        ]
      });

      compiler.hooks.emit.tap('test', compilation => {
        const manifest = JSON.parse(
          compilation.assets['build-manifest.json'].source().toString()
        );

        expect(manifest).toMatchObject({
          polyfillFiles: [],
          entries: {},
          bundles: {},
          chunkRequest: {},
          loadble: {}
        });
      });

      compiler.run(done);
    });

    /**
     * Should handle multiple entry points and generate correct manifest structure for each.
     * Validates that all entries are present and mapped correctly.
     */
    test('should handle multiple entry points correctly', done => {
      expect.assertions(1);
      const compiler = createCompiler({
        entry: {
          main: entry,
          secondary: entry
        },
        optimization: {
          runtimeChunk: {
            name: 'runtime'
          }
        },
        plugins: [
          new BuildManifestPlugin({
            filename: 'build-manifest.json'
          })
        ]
      });

      compiler.hooks.emit.tap('test', compilation => {
        const manifest = JSON.parse(
          compilation.assets['build-manifest.json'].source().toString()
        );

        expect(manifest).toMatchObject({
          polyfillFiles: [],
          entries: {
            main: {
              js: ['runtime.js', 'main.js']
            },
            secondary: {
              js: ['runtime.js', 'secondary.js']
            }
          },
          bundles: {
            main: 'main.js',
            secondary: 'secondary.js',
            runtime: 'runtime.js'
          },
          chunkRequest: {},
          loadble: {}
        });
      });

      compiler.run(done);
    });

    /**
     * Should handle a webpack configuration without a runtime chunk.
     * Ensures the manifest is still valid and does not include runtime.js.
     */
    test('should handle webpack configuration without runtime chunk', done => {
      expect.assertions(1);
      const compiler = createCompiler({
        entry: entry,
        plugins: [
          new BuildManifestPlugin({
            filename: 'build-manifest.json'
          })
        ]
      });

      compiler.hooks.emit.tap('test', compilation => {
        const manifest = JSON.parse(
          compilation.assets['build-manifest.json'].source().toString()
        );

        expect(manifest).toMatchObject({
          polyfillFiles: [],
          entries: {
            main: {
              js: ['main.js']
            }
          },
          bundles: {
            main: 'main.js'
          },
          chunkRequest: {},
          loadble: {}
        });
      });

      compiler.run(done);
    });

    /**
     * Should handle a webpack configuration with a custom runtime chunk name.
     * Ensures the manifest reflects the custom runtime chunk.
     */
    test('should handle webpack configuration with custom runtime chunk name', done => {
      expect.assertions(1);
      const customRuntimeName = 'custom-runtime';
      const compiler = createCompiler({
        entry: entry,
        optimization: {
          runtimeChunk: {
            name: customRuntimeName
          }
        },
        plugins: [
          new BuildManifestPlugin({
            filename: 'build-manifest.json'
          })
        ]
      });

      compiler.hooks.emit.tap('test', compilation => {
        const manifest = JSON.parse(
          compilation.assets['build-manifest.json'].source().toString()
        );

        expect(manifest).toMatchObject({
          polyfillFiles: [],
          entries: {
            main: {
              js: [`${customRuntimeName}.js`, 'main.js']
            }
          },
          bundles: {
            main: 'main.js',
            [customRuntimeName]: `${customRuntimeName}.js`
          },
          chunkRequest: {},
          loadble: {}
        });
      });

      compiler.run(done);
    });
  });

  /**
   * Tests for plugin instantiation with various option combinations.
   */
  describe('plugin instantiation', () => {
    /**
     * Should work with no options provided (uses all defaults).
     * Ensures plugin is robust to missing options.
     */
    test('should work with no options provided', done => {
      expect.assertions(1);
      const compiler = createCompiler({
        entry: entry,
        optimization: {
          runtimeChunk: {
            name: 'runtime'
          }
        },
        plugins: [new BuildManifestPlugin()]
      });

      compiler.hooks.emit.tap('test', compilation => {
        const manifest = JSON.parse(
          compilation.assets['build-manifest.json'].source().toString()
        );

        expect(manifest).toMatchObject({
          polyfillFiles: [],
          entries: {
            main: {
              js: ['runtime.js', 'main.js']
            }
          },
          bundles: {
            main: 'main.js',
            runtime: 'runtime.js'
          },
          chunkRequest: {},
          loadble: {}
        });
      });

      compiler.run(done);
    });

    /**
     * Should work with partial options (e.g., only filename provided).
     * Ensures plugin merges options with defaults correctly.
     */
    test('should work with partial options', done => {
      expect.assertions(1);
      const compiler = createCompiler({
        entry: entry,
        optimization: {
          runtimeChunk: {
            name: 'runtime'
          }
        },
        plugins: [
          new BuildManifestPlugin({
            filename: 'partial-manifest.json'
          })
        ]
      });

      compiler.hooks.emit.tap('test', compilation => {
        const manifest = JSON.parse(
          compilation.assets['partial-manifest.json'].source().toString()
        );

        expect(manifest).toMatchObject({
          polyfillFiles: [],
          entries: {
            main: {
              js: ['runtime.js', 'main.js']
            }
          },
          bundles: {
            main: 'main.js',
            runtime: 'runtime.js'
          },
          chunkRequest: {},
          loadble: {}
        });
      });

      compiler.run(done);
    });
  });

  /**
   * Tests for manifest structure and JSON validity.
   */
  describe('manifest structure validation', () => {
    /**
     * Should always include required top-level properties in the manifest.
     * Ensures the manifest structure is consistent and predictable.
     */
    test('should always include required top-level properties', done => {
      expect.assertions(1);
      const compiler = createCompiler({
        entry: entry,
        optimization: {
          runtimeChunk: {
            name: 'runtime'
          }
        },
        plugins: [
          new BuildManifestPlugin({
            filename: 'build-manifest.json'
          })
        ]
      });

      compiler.hooks.emit.tap('test', compilation => {
        const manifest = JSON.parse(
          compilation.assets['build-manifest.json'].source().toString()
        );

        expect(manifest).toMatchObject({
          polyfillFiles: expect.any(Array),
          entries: expect.any(Object),
          bundles: expect.any(Object),
          chunkRequest: expect.any(Object),
          loadble: expect.any(Object)
        });
      });

      compiler.run(done);
    });

    /**
     * Should generate a valid JSON structure for the manifest asset.
     * Ensures the output is always valid JSON and can be parsed.
     */
    test('should generate valid JSON structure', done => {
      expect.assertions(2);
      const compiler = createCompiler({
        entry: entry,
        optimization: {
          runtimeChunk: {
            name: 'runtime'
          }
        },
        plugins: [
          new BuildManifestPlugin({
            filename: 'build-manifest.json'
          })
        ]
      });

      compiler.hooks.emit.tap('test', compilation => {
        const asset = compilation.assets['build-manifest.json'];
        expect(asset).toBeDefined();

        // Verify it's valid JSON
        expect(() => {
          JSON.parse(asset.source().toString());
        }).not.toThrow();
      });

      compiler.run(done);
    });
  });
});
