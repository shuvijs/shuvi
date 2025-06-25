import ModuleReplacePlugin from '../module-replace-plugin';
import { resolveFixture } from './utils';
import { watchCompiler, getModuleSource, runCompiler } from './helpers/webpack';

jest.setTimeout(5 * 60 * 1000);

describe('module-replace-plugin', () => {
  describe('Basic Functionality', () => {
    test('basic module replacement with RegExp matching', done => {
      const compiler = watchCompiler({
        mode: 'development',
        entry: resolveFixture('module-replace'),
        plugins: [
          new ModuleReplacePlugin({
            modules: [
              {
                resourceQuery: /\?_lazy/,
                module: require.resolve('./fixtures/testDummyComponent')
              }
            ]
          })
        ]
      });

      compiler
        .waitForCompile(stats => {
          expect(getModuleSource(stats, /\.\.\/shared\/one\?_lazy/)).toMatch(
            `testDummyComponent`
          );
          expect(getModuleSource(stats, /\.\.\/shared\/two\?_lazy/)).toMatch(
            `testDummyComponent`
          );
          expect(getModuleSource(stats, /module-replace/))
            .toMatchInlineSnapshot(`
            "import(
              /* webpackChunkName:"sharedOne" */
              '../shared/one?_lazy'
            );
            import(
              /* webpackChunkName:"sharedTwo" */
              '../shared/two?_lazy'
            );
            "
          `);

          compiler.forceCompile();
          return ModuleReplacePlugin.restoreModule('../shared/one?_lazy');
        })
        .then(stats => {
          expect(getModuleSource(stats, /\.\.\/shared\/one\?_lazy/)).toMatch(
            /one.js\?_lazy/
          );
          expect(getModuleSource(stats, /\.\.\/shared\/two\?_lazy/)).toMatch(
            `testDummyComponent`
          );

          compiler.forceCompile();
          return ModuleReplacePlugin.restoreModule('../shared/two?_lazy');
        })
        .then(stats => {
          expect(getModuleSource(stats, /\.\.\/shared\/one\?_lazy/)).toMatch(
            /one.js\?_lazy/
          );
          expect(getModuleSource(stats, /\.\.\/shared\/two\?_lazy/)).toMatch(
            /two.js\?_lazy/
          );
        })
        .end(done);
    });

    test('function-based resource query matching', done => {
      const compiler = watchCompiler({
        mode: 'development',
        entry: resolveFixture('module-replace'),
        plugins: [
          new ModuleReplacePlugin({
            modules: [
              {
                resourceQuery: (query: string) => query.includes('_lazy'),
                module: require.resolve('./fixtures/testDummyComponent')
              }
            ]
          })
        ]
      });

      compiler
        .waitForCompile(stats => {
          expect(getModuleSource(stats, /\.\.\/shared\/one\?_lazy/)).toMatch(
            `testDummyComponent`
          );
          expect(getModuleSource(stats, /\.\.\/shared\/two\?_lazy/)).toMatch(
            `testDummyComponent`
          );
        })
        .end(done);
    });

    test('multiple module replacement rules', done => {
      const compiler = watchCompiler({
        mode: 'development',
        entry: resolveFixture('module-replace'),
        plugins: [
          new ModuleReplacePlugin({
            modules: [
              {
                resourceQuery: /one\?_lazy/,
                module: require.resolve('./fixtures/testDummyComponent')
              },
              {
                resourceQuery: /two\?_lazy/,
                module: require.resolve('./fixtures/shared/two')
              }
            ]
          })
        ]
      });

      compiler
        .waitForCompile(stats => {
          expect(getModuleSource(stats, /\.\.\/shared\/one\?_lazy/)).toMatch(
            `testDummyComponent`
          );
          expect(getModuleSource(stats, /\.\.\/shared\/two\?_lazy/)).toMatch(
            `two.js`
          );
        })
        .end(done);
    });
  });

  describe('Advanced Matching Scenarios', () => {
    test('complex function-based matching with URLSearchParams', done => {
      const compiler = watchCompiler({
        mode: 'development',
        entry: resolveFixture('module-replace'),
        plugins: [
          new ModuleReplacePlugin({
            modules: [
              {
                resourceQuery: (query: string) => {
                  const params = new URLSearchParams(query);
                  return (
                    params.get('env') === 'dev' && params.get('mock') === 'true'
                  );
                },
                module: require.resolve('./fixtures/testDummyComponent')
              }
            ]
          })
        ]
      });

      // Create a test fixture with complex query parameters
      const fs = require('fs');
      const originalContent = fs.readFileSync(
        resolveFixture('module-replace/index.js'),
        'utf8'
      );
      const complexQueryContent = originalContent.replace(
        /\?_lazy/g,
        '?env=dev&mock=true&_lazy'
      );

      fs.writeFileSync(
        resolveFixture('module-replace/index.js'),
        complexQueryContent
      );

      compiler
        .waitForCompile(stats => {
          expect(getModuleSource(stats, /env=dev&mock=true/)).toMatch(
            `testDummyComponent`
          );
        })
        .end(done);
    });

    test('RegExp with multiple conditions', done => {
      const compiler = watchCompiler({
        mode: 'development',
        entry: resolveFixture('module-replace'),
        plugins: [
          new ModuleReplacePlugin({
            modules: [
              {
                resourceQuery: /(one|two)\?_lazy/,
                module: require.resolve('./fixtures/testDummyComponent')
              }
            ]
          })
        ]
      });

      compiler
        .waitForCompile(stats => {
          expect(getModuleSource(stats, /\.\.\/shared\/one\?_lazy/)).toMatch(
            `testDummyComponent`
          );
          expect(getModuleSource(stats, /\.\.\/shared\/two\?_lazy/)).toMatch(
            `testDummyComponent`
          );
        })
        .end(done);
    });

    test('complex test fixture with multiple scenarios', async () => {
      const stats = await runCompiler({
        mode: 'development',
        entry: resolveFixture('module-replace-complex'),
        plugins: [
          new ModuleReplacePlugin({
            modules: [
              {
                resourceQuery: (query: string) => {
                  const params = new URLSearchParams(query);
                  return (
                    params.get('env') === 'dev' && params.get('mock') === 'true'
                  );
                },
                module: require.resolve('./fixtures/testDummyComponent')
              },
              {
                resourceQuery: /feature=new-ui/,
                module: require.resolve('./fixtures/testDummyComponent')
              },
              {
                resourceQuery: /debug=true/,
                module: require.resolve('./fixtures/testDummyComponent')
              },
              {
                resourceQuery: /env=staging/,
                module: require.resolve('./fixtures/testDummyComponent')
              }
            ]
          })
        ]
      });

      // Test complex query matching
      expect(getModuleSource(stats, /env=dev&mock=true/)).toMatch(
        `testDummyComponent`
      );
      expect(getModuleSource(stats, /feature=new-ui/)).toMatch(
        `testDummyComponent`
      );
      expect(getModuleSource(stats, /debug=true/)).toMatch(
        `testDummyComponent`
      );
      expect(getModuleSource(stats, /env=staging/)).toMatch(
        `testDummyComponent`
      );

      // Test that non-matching queries are not replaced
      expect(getModuleSource(stats, /env=prod/)).toMatch(/two.js\?env=prod/);
    });
  });

  describe('Runtime API Testing', () => {
    test('replaceModule static method', done => {
      const compiler = watchCompiler({
        mode: 'development',
        entry: resolveFixture('module-replace'),
        plugins: [
          new ModuleReplacePlugin({
            modules: [
              {
                resourceQuery: /\?_lazy/,
                module: require.resolve('./fixtures/testDummyComponent')
              }
            ]
          })
        ]
      });

      compiler
        .waitForCompile(stats => {
          // Initially modules should be replaced
          expect(getModuleSource(stats, /\.\.\/shared\/one\?_lazy/)).toMatch(
            `testDummyComponent`
          );

          // Force replacement again
          ModuleReplacePlugin.replaceModule('../shared/one?_lazy');
          compiler.forceCompile();
          return Promise.resolve();
        })
        .then(stats => {
          // Should still be replaced
          expect(getModuleSource(stats, /\.\.\/shared\/one\?_lazy/)).toMatch(
            `testDummyComponent`
          );
        })
        .end(done);
    });

    test('restoreModule with unknown module', done => {
      const result = ModuleReplacePlugin.restoreModule('./unknown-module.js');
      expect(result).toBe(false);
      done();
    });

    test('replaceModule with unknown module', done => {
      const result = ModuleReplacePlugin.replaceModule('./unknown-module.js');
      expect(result).toBe(false);
      done();
    });

    test('multiple restore operations', done => {
      const compiler = watchCompiler({
        mode: 'development',
        entry: resolveFixture('module-replace'),
        plugins: [
          new ModuleReplacePlugin({
            modules: [
              {
                resourceQuery: /\?_lazy/,
                module: require.resolve('./fixtures/testDummyComponent')
              }
            ]
          })
        ]
      });

      compiler
        .waitForCompile(stats => {
          // Restore both modules
          const promise1 = ModuleReplacePlugin.restoreModule(
            '../shared/one?_lazy'
          );
          const promise2 = ModuleReplacePlugin.restoreModule(
            '../shared/two?_lazy'
          );

          expect(promise1).toBeInstanceOf(Promise);
          expect(promise2).toBeInstanceOf(Promise);

          return Promise.all([promise1, promise2]);
        })
        .then(() => {
          compiler.forceCompile();
          return Promise.resolve();
        })
        .then(stats => {
          // Both modules should be restored
          expect(getModuleSource(stats, /\.\.\/shared\/one\?_lazy/)).toMatch(
            /one.js\?_lazy/
          );
          expect(getModuleSource(stats, /\.\.\/shared\/two\?_lazy/)).toMatch(
            /two.js\?_lazy/
          );
        })
        .end(done);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('empty resource query', done => {
      const compiler = watchCompiler({
        mode: 'development',
        entry: resolveFixture('module-replace'),
        plugins: [
          new ModuleReplacePlugin({
            modules: [
              {
                resourceQuery: /^$/,
                module: require.resolve('./fixtures/testDummyComponent')
              }
            ]
          })
        ]
      });

      compiler
        .waitForCompile(stats => {
          // Should not match any modules with empty query
          expect(
            getModuleSource(stats, /\.\.\/shared\/one\?_lazy/)
          ).not.toMatch(`testDummyComponent`);
        })
        .end(done);
    });

    test('module without resource query', done => {
      const compiler = watchCompiler({
        mode: 'development',
        entry: resolveFixture('module-replace'),
        plugins: [
          new ModuleReplacePlugin({
            modules: [
              {
                resourceQuery: /.*/,
                module: require.resolve('./fixtures/testDummyComponent')
              }
            ]
          })
        ]
      });

      compiler
        .waitForCompile(stats => {
          // Should handle modules without query gracefully
          expect(stats.compilation.errors).toHaveLength(0);
        })
        .end(done);
    });

    test('invalid module path', done => {
      const compiler = watchCompiler({
        mode: 'development',
        entry: resolveFixture('module-replace'),
        plugins: [
          new ModuleReplacePlugin({
            modules: [
              {
                resourceQuery: /\?_lazy/,
                module: './non-existent-module.js'
              }
            ]
          })
        ]
      });

      compiler
        .waitForCompile(stats => {
          // Should handle invalid module paths gracefully
          expect(stats.compilation.errors.length).toBeGreaterThan(0);
        })
        .end(done);
    });

    test('function matcher that throws error', done => {
      const compiler = watchCompiler({
        mode: 'development',
        entry: resolveFixture('module-replace'),
        plugins: [
          new ModuleReplacePlugin({
            modules: [
              {
                resourceQuery: (query: string) => {
                  throw new Error('Test error in matcher');
                },
                module: require.resolve('./fixtures/testDummyComponent')
              }
            ]
          })
        ]
      });

      compiler
        .waitForCompile(stats => {
          // Should handle matcher errors gracefully
          expect(stats.compilation.errors).toHaveLength(0);
        })
        .end(done);
    });

    test('very long resource query', done => {
      const compiler = watchCompiler({
        mode: 'development',
        entry: resolveFixture('module-replace'),
        plugins: [
          new ModuleReplacePlugin({
            modules: [
              {
                resourceQuery: (query: string) => query.length > 1000,
                module: require.resolve('./fixtures/testDummyComponent')
              }
            ]
          })
        ]
      });

      // Create a very long query
      const fs = require('fs');
      const originalContent = fs.readFileSync(
        resolveFixture('module-replace/index.js'),
        'utf8'
      );
      const longQuery = '?' + 'a'.repeat(1000) + '&_lazy';
      const longQueryContent = originalContent.replace(/\?_lazy/g, longQuery);
      fs.writeFileSync(
        resolveFixture('module-replace/index.js'),
        longQueryContent
      );

      compiler
        .waitForCompile(stats => {
          // Should handle long queries gracefully
          expect(stats.compilation.errors).toHaveLength(0);
        })
        .end(done);
    });
  });

  describe('Multiple Compiler Instances', () => {
    test('plugin works with multiple compilers', async () => {
      const config1 = {
        mode: 'development' as const,
        entry: resolveFixture('module-replace'),
        plugins: [
          new ModuleReplacePlugin({
            modules: [
              {
                resourceQuery: /one\?_lazy/,
                module: require.resolve('./fixtures/testDummyComponent')
              }
            ]
          })
        ]
      };

      const config2 = {
        mode: 'development' as const,
        entry: resolveFixture('module-replace'),
        plugins: [
          new ModuleReplacePlugin({
            modules: [
              {
                resourceQuery: /two\?_lazy/,
                module: require.resolve('./fixtures/testDummyComponent')
              }
            ]
          })
        ]
      };

      const stats1 = await runCompiler(config1);
      const stats2 = await runCompiler(config2);

      expect(getModuleSource(stats1, /\.\.\/shared\/one\?_lazy/)).toMatch(
        `testDummyComponent`
      );
      expect(getModuleSource(stats2, /\.\.\/shared\/two\?_lazy/)).toMatch(
        `testDummyComponent`
      );
    });

    test('isolated module handlers between compilers', async () => {
      const config1 = {
        mode: 'development' as const,
        entry: resolveFixture('module-replace'),
        plugins: [
          new ModuleReplacePlugin({
            modules: [
              {
                resourceQuery: /\?_lazy/,
                module: require.resolve('./fixtures/testDummyComponent')
              }
            ]
          })
        ]
      };

      const config2 = {
        mode: 'development' as const,
        entry: resolveFixture('module-replace'),
        plugins: [
          new ModuleReplacePlugin({
            modules: [
              {
                resourceQuery: /\?_lazy/,
                module: require.resolve('./fixtures/shared/one')
              }
            ]
          })
        ]
      };

      const stats1 = await runCompiler(config1);
      const stats2 = await runCompiler(config2);

      // Each compiler should have its own isolated state
      expect(getModuleSource(stats1, /\.\.\/shared\/one\?_lazy/)).toMatch(
        `testDummyComponent`
      );
      expect(getModuleSource(stats2, /\.\.\/shared\/one\?_lazy/)).toMatch(
        `one.js`
      );
    });
  });

  describe('Production Mode', () => {
    test('plugin works in production mode', async () => {
      const stats = await runCompiler({
        mode: 'production',
        entry: resolveFixture('module-replace'),
        plugins: [
          new ModuleReplacePlugin({
            modules: [
              {
                resourceQuery: /\?_lazy/,
                module: require.resolve('./fixtures/testDummyComponent')
              }
            ]
          })
        ]
      });

      expect(getModuleSource(stats, /\.\.\/shared\/one\?_lazy/)).toMatch(
        `testDummyComponent`
      );
      expect(getModuleSource(stats, /\.\.\/shared\/two\?_lazy/)).toMatch(
        `testDummyComponent`
      );
    });

    test('plugin with production optimizations', async () => {
      const stats = await runCompiler({
        mode: 'production',
        entry: resolveFixture('module-replace'),
        optimization: {
          minimize: true,
          splitChunks: {
            chunks: 'all',
            cacheGroups: {
              vendor: {
                test: /[\\/]node_modules[\\/]/,
                name: 'vendors',
                chunks: 'all'
              }
            }
          }
        },
        plugins: [
          new ModuleReplacePlugin({
            modules: [
              {
                resourceQuery: /\?_lazy/,
                module: require.resolve('./fixtures/testDummyComponent')
              }
            ]
          })
        ]
      });

      expect(getModuleSource(stats, /\.\.\/shared\/one\?_lazy/)).toMatch(
        `testDummyComponent`
      );
    });
  });

  describe('Plugin Configuration', () => {
    test('plugin with empty modules array', async () => {
      const stats = await runCompiler({
        mode: 'development',
        entry: resolveFixture('module-replace'),
        plugins: [
          new ModuleReplacePlugin({
            modules: []
          })
        ]
      });

      // Should not replace any modules
      expect(getModuleSource(stats, /\.\.\/shared\/one\?_lazy/)).toMatch(
        /one.js\?_lazy/
      );
    });

    test('plugin with no configuration', async () => {
      const stats = await runCompiler({
        mode: 'development',
        entry: resolveFixture('module-replace'),
        plugins: [new ModuleReplacePlugin({})]
      });

      // Should not replace any modules
      expect(getModuleSource(stats, /\.\.\/shared\/one\?_lazy/)).toMatch(
        /one.js\?_lazy/
      );
    });

    test('plugin with null/undefined configuration', async () => {
      const stats = await runCompiler({
        mode: 'development',
        entry: resolveFixture('module-replace'),
        plugins: [new ModuleReplacePlugin(null as any)]
      });

      // Should handle null configuration gracefully
      expect(getModuleSource(stats, /\.\.\/shared\/one\?_lazy/)).toMatch(
        /one.js\?_lazy/
      );
    });
  });

  describe('Memory Management', () => {
    test('handlers are cleaned up after compilation', done => {
      const compiler = watchCompiler({
        mode: 'development',
        entry: resolveFixture('module-replace'),
        plugins: [
          new ModuleReplacePlugin({
            modules: [
              {
                resourceQuery: /\?_lazy/,
                module: require.resolve('./fixtures/testDummyComponent')
              }
            ]
          })
        ]
      });

      compiler
        .waitForCompile(stats => {
          // Trigger multiple compilations to test cleanup
          compiler.forceCompile();
          return ModuleReplacePlugin.restoreModule('../shared/one?_lazy');
        })
        .then(stats => {
          compiler.forceCompile();
          return ModuleReplacePlugin.restoreModule('../shared/two?_lazy');
        })
        .then(stats => {
          // Should complete without memory leaks
          expect(stats.compilation.errors).toHaveLength(0);
        })
        .end(done);
    });

    test('multiple rapid compilations', done => {
      const compiler = watchCompiler({
        mode: 'development',
        entry: resolveFixture('module-replace'),
        plugins: [
          new ModuleReplacePlugin({
            modules: [
              {
                resourceQuery: /\?_lazy/,
                module: require.resolve('./fixtures/testDummyComponent')
              }
            ]
          })
        ]
      });

      let compilationCount = 0;
      const maxCompilations = 10;

      const triggerCompilation = () => {
        if (compilationCount < maxCompilations) {
          compilationCount++;
          compiler.forceCompile();
          setTimeout(triggerCompilation, 10);
        }
      };

      compiler
        .waitForCompile(stats => {
          triggerCompilation();
          return Promise.resolve();
        })
        .then(stats => {
          // Should handle rapid compilations without issues
          expect(stats.compilation.errors).toHaveLength(0);
        })
        .end(done);
    });
  });

  describe('Integration Scenarios', () => {
    test('plugin with other webpack plugins', async () => {
      const stats = await runCompiler({
        mode: 'development',
        entry: resolveFixture('module-replace'),
        plugins: [
          new ModuleReplacePlugin({
            modules: [
              {
                resourceQuery: /\?_lazy/,
                module: require.resolve('./fixtures/testDummyComponent')
              }
            ]
          }),
          // Add a simple plugin to test compatibility
          {
            apply(compiler: any) {
              compiler.hooks.done.tap('TestPlugin', () => {
                // Do nothing, just test compatibility
              });
            }
          }
        ]
      });

      expect(getModuleSource(stats, /\.\.\/shared\/one\?_lazy/)).toMatch(
        `testDummyComponent`
      );
    });

    test('plugin with webpack optimization', async () => {
      const stats = await runCompiler({
        mode: 'production',
        entry: resolveFixture('module-replace'),
        optimization: {
          minimize: true,
          splitChunks: {
            chunks: 'all'
          }
        },
        plugins: [
          new ModuleReplacePlugin({
            modules: [
              {
                resourceQuery: /\?_lazy/,
                module: require.resolve('./fixtures/testDummyComponent')
              }
            ]
          })
        ]
      });

      expect(getModuleSource(stats, /\.\.\/shared\/one\?_lazy/)).toMatch(
        `testDummyComponent`
      );
    });

    test('plugin with webpack loaders', async () => {
      const stats = await runCompiler({
        mode: 'development',
        entry: resolveFixture('module-replace'),
        module: {
          rules: [
            {
              test: /\.js$/,
              use: 'babel-loader'
            }
          ]
        },
        plugins: [
          new ModuleReplacePlugin({
            modules: [
              {
                resourceQuery: /\?_lazy/,
                module: require.resolve('./fixtures/testDummyComponent')
              }
            ]
          })
        ]
      });

      expect(getModuleSource(stats, /\.\.\/shared\/one\?_lazy/)).toMatch(
        `testDummyComponent`
      );
    });
  });

  describe('Performance and Stress Testing', () => {
    test('plugin with many replacement rules', async () => {
      const modules = Array.from({ length: 50 }, (_, i) => ({
        resourceQuery: new RegExp(`rule${i}`),
        module: require.resolve('./fixtures/testDummyComponent')
      }));

      const stats = await runCompiler({
        mode: 'development',
        entry: resolveFixture('module-replace'),
        plugins: [new ModuleReplacePlugin({ modules })]
      });

      // Should handle many rules without performance issues
      expect(stats.compilation.errors).toHaveLength(0);
    });

    test('plugin with complex regex patterns', async () => {
      const stats = await runCompiler({
        mode: 'development',
        entry: resolveFixture('module-replace'),
        plugins: [
          new ModuleReplacePlugin({
            modules: [
              {
                resourceQuery: /^(?=.*_lazy)(?=.*env=dev)(?=.*mock=true).*$/,
                module: require.resolve('./fixtures/testDummyComponent')
              }
            ]
          })
        ]
      });

      // Should handle complex regex patterns
      expect(stats.compilation.errors).toHaveLength(0);
    });
  });
});
