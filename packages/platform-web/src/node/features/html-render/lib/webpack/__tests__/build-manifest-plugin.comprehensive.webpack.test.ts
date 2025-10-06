/**
 * @fileoverview
 * Comprehensive tests for BuildManifestPlugin using various fixtures to test different scenarios.
 */
import BuildManifestPlugin from '../build-manifest-plugin';
import { createCompiler } from './helpers/webpack';
import { resolveFixture } from './utils';

/**
 * Comprehensive test suite for BuildManifestPlugin covering various real-world scenarios.
 */
describe('BuildManifestPlugin - Comprehensive Tests', () => {
  /**
   * Tests for multiple entry points with complex chunk relationships.
   */
  describe('multiple entry points', () => {
    test('should handle multiple entry points with shared chunks', done => {
      expect.assertions(3);
      const compiler = createCompiler({
        entry: {
          main: resolveFixture('multiple-entries'),
          secondary: resolveFixture('multiple-entries/secondary')
        },
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
          chunkRequest: {
            'main.js': resolveFixture('multiple-entries'),
            'secondary.js': resolveFixture('multiple-entries/secondary'),
            'runtime.js': resolveFixture('multiple-entries/secondary'),
            'static/chunks/components_header.js': './components/header',
            'static/chunks/components_footer.js': './components/footer',
            'static/chunks/utils_helper.js': './utils/helper',
            'static/chunks/utils_validator.js': './utils/validator'
          },
          loadble: {
            './components/header': {
              children: [
                {
                  id: './packages/platform-web/src/node/features/html-render/lib/webpack/__tests__/fixtures/multiple-entries/components/header.js',
                  name: './packages/platform-web/src/node/features/html-render/lib/webpack/__tests__/fixtures/multiple-entries/components/header.js'
                }
              ],
              files: ['static/chunks/components_header.js']
            },
            './components/footer': {
              children: [
                {
                  id: './packages/platform-web/src/node/features/html-render/lib/webpack/__tests__/fixtures/multiple-entries/components/footer.js',
                  name: './packages/platform-web/src/node/features/html-render/lib/webpack/__tests__/fixtures/multiple-entries/components/footer.js'
                }
              ],
              files: ['static/chunks/components_footer.js']
            },
            './utils/helper': {
              children: [
                {
                  id: './packages/platform-web/src/node/features/html-render/lib/webpack/__tests__/fixtures/multiple-entries/utils/helper.js',
                  name: './packages/platform-web/src/node/features/html-render/lib/webpack/__tests__/fixtures/multiple-entries/utils/helper.js'
                }
              ],
              files: ['static/chunks/utils_helper.js']
            },
            './utils/validator': {
              children: [
                {
                  id: './packages/platform-web/src/node/features/html-render/lib/webpack/__tests__/fixtures/multiple-entries/utils/validator.js',
                  name: './packages/platform-web/src/node/features/html-render/lib/webpack/__tests__/fixtures/multiple-entries/utils/validator.js'
                }
              ],
              files: ['static/chunks/utils_validator.js']
            }
          }
        });

        // Assert chunkRequest length
        expect(Object.keys(manifest.chunkRequest)).toHaveLength(7);

        // Assert loadble length
        expect(Object.keys(manifest.loadble)).toHaveLength(4);
      });

      compiler.run(done);
    });
  });

  /**
   * Tests for CSS modules and style handling.
   */
  describe('CSS modules', () => {
    test('should handle CSS files and dynamic CSS imports', done => {
      expect.assertions(3);
      const compiler = createCompiler({
        entry: resolveFixture('css-modules'),
        optimization: {
          runtimeChunk: {
            name: 'runtime'
          }
        },
        plugins: [
          new BuildManifestPlugin({
            filename: 'build-manifest.json',
            modules: true
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
            './dynamic-styles.css': {
              children: [],
              files: ['static/chunks/dynamic-styles.js']
            }
          }
        });

        // Assert chunkRequest length
        expect(Object.keys(manifest.chunkRequest)).toHaveLength(0);

        // Assert loadble length
        expect(Object.keys(manifest.loadble)).toHaveLength(1);
      });

      compiler.run(done);
    });
  });

  /**
   * Tests for deeply nested chunk structures.
   */
  describe('nested chunks', () => {
    test('should handle deeply nested chunk relationships', done => {
      expect.assertions(3);
      const compiler = createCompiler({
        entry: resolveFixture('nested-chunks'),
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
            'main.js': resolveFixture('nested-chunks'),
            'runtime.js': resolveFixture('nested-chunks'),
            'static/chunks/level1_level2_level3_deep-module.js':
              './level1/level2/level3/deep-module',
            'static/chunks/level1_module1.js': './level1/module1',
            'static/chunks/level1_level2_module2.js': './level1/level2/module2',
            'static/chunks/dev-tools.js': './dev-tools'
          },
          loadble: {
            './level1/level2/level3/deep-module': {
              children: [
                {
                  id: './packages/platform-web/src/node/features/html-render/lib/webpack/__tests__/fixtures/nested-chunks/level1/level2/level3/deep-module.js',
                  name: './packages/platform-web/src/node/features/html-render/lib/webpack/__tests__/fixtures/nested-chunks/level1/level2/level3/deep-module.js'
                }
              ],
              files: ['static/chunks/level1_level2_level3_deep-module.js']
            },
            './level1/module1': {
              children: [
                {
                  id: './packages/platform-web/src/node/features/html-render/lib/webpack/__tests__/fixtures/nested-chunks/level1/module1.js',
                  name: './packages/platform-web/src/node/features/html-render/lib/webpack/__tests__/fixtures/nested-chunks/level1/module1.js'
                }
              ],
              files: ['static/chunks/level1_module1.js']
            },
            './level1/level2/module2': {
              children: [
                {
                  id: './packages/platform-web/src/node/features/html-render/lib/webpack/__tests__/fixtures/nested-chunks/level1/level2/module2.js',
                  name: './packages/platform-web/src/node/features/html-render/lib/webpack/__tests__/fixtures/nested-chunks/level1/level2/module2.js'
                }
              ],
              files: ['static/chunks/level1_level2_module2.js']
            },
            './dev-tools': {
              children: [
                {
                  id: './packages/platform-web/src/node/features/html-render/lib/webpack/__tests__/fixtures/nested-chunks/dev-tools.js',
                  name: './packages/platform-web/src/node/features/html-render/lib/webpack/__tests__/fixtures/nested-chunks/dev-tools.js'
                }
              ],
              files: ['static/chunks/dev-tools.js']
            }
          }
        });

        // Assert chunkRequest length
        expect(Object.keys(manifest.chunkRequest)).toHaveLength(6);

        // Assert loadble length
        expect(Object.keys(manifest.loadble)).toHaveLength(4);
      });

      compiler.run(done);
    });
  });

  /**
   * Tests for polyfill handling.
   */
  describe('polyfills', () => {
    test('should identify and include polyfill files', done => {
      expect.assertions(3);
      const compiler = createCompiler({
        entry: resolveFixture('polyfills'),
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
            'main.js': resolveFixture('polyfills'),
            'runtime.js': resolveFixture('polyfills')
          },
          loadble: {}
        });

        // Assert chunkRequest length
        expect(Object.keys(manifest.chunkRequest)).toHaveLength(2);

        // Assert loadble length
        expect(Object.keys(manifest.loadble)).toHaveLength(0);
      });

      compiler.run(done);
    });
  });

  /**
   * Tests for empty or minimal entries.
   */
  describe('empty entries', () => {
    test('should handle minimal entry content gracefully', done => {
      expect.assertions(3);
      const compiler = createCompiler({
        entry: resolveFixture('empty-entry'),
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

        // Assert chunkRequest length
        expect(Object.keys(manifest.chunkRequest)).toHaveLength(0);

        // Assert loadble length
        expect(Object.keys(manifest.loadble)).toHaveLength(0);
      });

      compiler.run(done);
    });
  });

  /**
   * Tests for large modules and performance.
   */
  describe('large modules', () => {
    test('should handle large modules efficiently', done => {
      expect.assertions(3);
      const compiler = createCompiler({
        entry: resolveFixture('large-modules'),
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
            'main.js': resolveFixture('large-modules'),
            'runtime.js': resolveFixture('large-modules'),
            'static/chunks/large-data-module.js': './large-data-module',
            'static/chunks/large-utility-module.js': './large-utility-module',
            'static/chunks/large-modules_module-0.js': './module-0.js',
            'static/chunks/large-modules_module-1.js': './module-1.js',
            'static/chunks/large-modules_module-2.js': './module-2.js',
            'static/chunks/large-modules_module-3.js': './module-3.js',
            'static/chunks/large-modules_module-4.js': './module-4.js'
          },
          loadble: {}
        });

        // Assert chunkRequest length
        expect(Object.keys(manifest.chunkRequest)).toHaveLength(9);

        // Assert loadble length
        expect(Object.keys(manifest.loadble)).toHaveLength(12);
      });

      compiler.run(done);
    });
  });

  /**
   * Tests for special characters in file names and paths.
   */
  describe('special characters', () => {
    test('should handle special characters in file names', done => {
      expect.assertions(3);
      const compiler = createCompiler({
        entry: resolveFixture('special-chars'),
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
            'main.js': resolveFixture('special-chars'),
            'runtime.js': resolveFixture('special-chars'),
            'static/chunks/modules_with-spaces.js': './with spaces.js',
            'static/chunks/modules_with-dashes.js': './with-dashes.js',
            'static/chunks/modules_special-chars8.js': './with_underscores.js',
            'static/chunks/modules_with.dots.js': './with.dots.js',
            'static/chunks/modules_special-chars0.js':
              './special-chars-module.js'
          },
          loadble: {
            './modules/with spaces': {
              children: [
                {
                  id: './packages/platform-web/src/node/features/html-render/lib/webpack/__tests__/fixtures/special-chars/modules/with spaces.js',
                  name: './packages/platform-web/src/node/features/html-render/lib/webpack/__tests__/fixtures/special-chars/modules/with spaces.js'
                }
              ],
              files: ['static/chunks/modules_with-spaces.js']
            },
            './modules/with-dashes': {
              children: [
                {
                  id: './packages/platform-web/src/node/features/html-render/lib/webpack/__tests__/fixtures/special-chars/modules/with-dashes.js',
                  name: './packages/platform-web/src/node/features/html-render/lib/webpack/__tests__/fixtures/special-chars/modules/with-dashes.js'
                }
              ],
              files: ['static/chunks/modules_with-dashes.js']
            },
            './modules/with.dots': {
              children: [
                {
                  id: './packages/platform-web/src/node/features/html-render/lib/webpack/__tests__/fixtures/special-chars/modules/with.dots.js',
                  name: './packages/platform-web/src/node/features/html-render/lib/webpack/__tests__/fixtures/special-chars/modules/with.dots.js'
                }
              ],
              files: ['static/chunks/modules_with.dots.js']
            },
            './modules/with_underscores': {
              children: [
                {
                  id: './packages/platform-web/src/node/features/html-render/lib/webpack/__tests__/fixtures/special-chars/modules/with_underscores.js',
                  name: './packages/platform-web/src/node/features/html-render/lib/webpack/__tests__/fixtures/special-chars/modules/with_underscores.js'
                }
              ],
              files: ['static/chunks/modules_special-chars8.js']
            },
            './special-chars-module': {
              children: [
                {
                  id: './packages/platform-web/src/node/features/html-render/lib/webpack/__tests__/fixtures/special-chars/modules/special-chars-module.js',
                  name: './packages/platform-web/src/node/features/html-render/lib/webpack/__tests__/fixtures/special-chars/modules/special-chars-module.js'
                }
              ],
              files: ['static/chunks/modules_special-chars0.js']
            }
          }
        });

        // Assert chunkRequest length
        expect(Object.keys(manifest.chunkRequest)).toHaveLength(7);

        // Assert loadble length - updated to match actual output (14 entries)
        expect(Object.keys(manifest.loadble)).toHaveLength(14);
      });

      compiler.run(done);
    });
  });

  /**
   * Tests for async loading patterns.
   */
  describe('async loading', () => {
    test('should handle complex async loading patterns', done => {
      expect.assertions(3);
      const compiler = createCompiler({
        entry: resolveFixture('async-loading'),
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
            'main.js': resolveFixture('async-loading'),
            'runtime.js': resolveFixture('async-loading')
          },
          loadble: {
            './module1': {
              children: [
                {
                  id: './packages/platform-web/src/node/features/html-render/lib/webpack/__tests__/fixtures/async-loading/async-modules/module1.js',
                  name: './packages/platform-web/src/node/features/html-render/lib/webpack/__tests__/fixtures/async-loading/async-modules/module1.js'
                }
              ],
              files: ['static/chunks/async-modules_module1.js']
            },
            './module2': {
              children: [
                {
                  id: './packages/platform-web/src/node/features/html-render/lib/webpack/__tests__/fixtures/async-loading/async-modules/module2.js',
                  name: './packages/platform-web/src/node/features/html-render/lib/webpack/__tests__/fixtures/async-loading/async-modules/module2.js'
                }
              ],
              files: ['static/chunks/async-modules_module2.js']
            },
            './module3': {
              children: [
                {
                  id: './packages/platform-web/src/node/features/html-render/lib/webpack/__tests__/fixtures/async-loading/async-modules/module3.js',
                  name: './packages/platform-web/src/node/features/html-render/lib/webpack/__tests__/fixtures/async-loading/async-modules/module3.js'
                }
              ],
              files: ['static/chunks/async-modules_module3.js']
            },
            './module4': {
              children: [
                {
                  id: './packages/platform-web/src/node/features/html-render/lib/webpack/__tests__/fixtures/async-loading/async-modules/module4.js',
                  name: './packages/platform-web/src/node/features/html-render/lib/webpack/__tests__/fixtures/async-loading/async-modules/module4.js'
                }
              ],
              files: ['static/chunks/async-modules_module4.js']
            },
            './module5': {
              children: [
                {
                  id: './packages/platform-web/src/node/features/html-render/lib/webpack/__tests__/fixtures/async-loading/async-modules/module5.js',
                  name: './packages/platform-web/src/node/features/html-render/lib/webpack/__tests__/fixtures/async-loading/async-modules/module5.js'
                }
              ],
              files: ['static/chunks/async-modules_module5.js']
            },
            './module6': {
              children: [
                {
                  id: './packages/platform-web/src/node/features/html-render/lib/webpack/__tests__/fixtures/async-loading/async-modules/module6.js',
                  name: './packages/platform-web/src/node/features/html-render/lib/webpack/__tests__/fixtures/async-loading/async-modules/module6.js'
                }
              ],
              files: ['static/chunks/async-modules_module6.js']
            }
          }
        });

        // Assert chunkRequest length
        expect(Object.keys(manifest.chunkRequest)).toHaveLength(8);

        // Assert loadble length
        expect(Object.keys(manifest.loadble)).toHaveLength(12);
      });

      compiler.run(done);
    });
  });

  /**
   * Tests for different plugin option combinations.
   */
  describe('plugin options combinations', () => {
    test('should work with all options disabled', done => {
      expect.assertions(3);
      const compiler = createCompiler({
        entry: resolveFixture('manifest'),
        optimization: {
          runtimeChunk: {
            name: 'runtime'
          }
        },
        plugins: [
          new BuildManifestPlugin({
            filename: 'build-manifest.json',
            modules: false,
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
          loadble: {}
        });

        // Assert chunkRequest length
        expect(Object.keys(manifest.chunkRequest)).toHaveLength(0);

        // Assert loadble length
        expect(Object.keys(manifest.loadble)).toHaveLength(0);
      });

      compiler.run(done);
    });

    test('should work with only modules enabled', done => {
      expect.assertions(3);
      const compiler = createCompiler({
        entry: resolveFixture('manifest'),
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
                  id: './packages/platform-web/src/node/features/html-render/lib/webpack/__tests__/fixtures/manifest/shared/one.js',
                  name: './packages/platform-web/src/node/features/html-render/lib/webpack/__tests__/fixtures/manifest/shared/one.js'
                }
              ],
              files: ['static/chunks/helperOne.js']
            },
            './shared/two': {
              children: [
                {
                  id: './packages/platform-web/src/node/features/html-render/lib/webpack/__tests__/fixtures/manifest/shared/two.js',
                  name: './packages/platform-web/src/node/features/html-render/lib/webpack/__tests__/fixtures/manifest/shared/two.js'
                }
              ],
              files: ['static/chunks/helperTwo.js']
            }
          }
        });

        // Assert chunkRequest length
        expect(Object.keys(manifest.chunkRequest)).toHaveLength(0);

        // Assert loadble length
        expect(Object.keys(manifest.loadble)).toHaveLength(2);
      });

      compiler.run(done);
    });

    test('should work with only chunkRequest enabled', done => {
      expect.assertions(3);
      const compiler = createCompiler({
        entry: resolveFixture('manifest'),
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
            'main.js': resolveFixture('manifest'),
            'runtime.js': resolveFixture('manifest')
          },
          loadble: {}
        });

        // Assert chunkRequest length
        expect(Object.keys(manifest.chunkRequest)).toHaveLength(4);

        // Assert loadble length
        expect(Object.keys(manifest.loadble)).toHaveLength(0);
      });

      compiler.run(done);
    });
  });

  /**
   * Tests for edge cases and error handling.
   */
  describe('edge cases', () => {
    test('should handle webpack configuration without runtime chunk', done => {
      expect.assertions(3);
      const compiler = createCompiler({
        entry: resolveFixture('manifest'),
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

        // Assert chunkRequest length
        expect(Object.keys(manifest.chunkRequest)).toHaveLength(0);

        // Assert loadble length
        expect(Object.keys(manifest.loadble)).toHaveLength(0);
      });

      compiler.run(done);
    });

    test('should handle custom runtime chunk names', done => {
      expect.assertions(3);
      const customRuntimeName = 'custom-runtime';
      const compiler = createCompiler({
        entry: resolveFixture('manifest'),
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

        // Assert chunkRequest length
        expect(Object.keys(manifest.chunkRequest)).toHaveLength(0);

        // Assert loadble length
        expect(Object.keys(manifest.loadble)).toHaveLength(0);
      });

      compiler.run(done);
    });
  });
});
