import { runShuviCommand } from 'shuvi-test-utils';

describe('shuvi inspect command', () => {
  test('should be log webpack config correctly', () => {
    const output = runShuviCommand('inspect', ['test/fixtures/inspect']);
    expect(output).toMatch(`mode: 'development'`);
    expect(output).toMatch(`name: 'shuvi/server'`);
    expect(output).toMatch(`name: 'shuvi/client'`);
  });

  test('can specify --mode', () => {
    const output = runShuviCommand('inspect', [
      'test/fixtures/inspect',
      '--mode=production'
    ]);
    expect(output).toMatch(`mode: 'production'`);
    expect(output).toMatch(`name: 'shuvi/server'`);
    expect(output).toMatch(`name: 'shuvi/client'`);
  });

  test('can specify --verbose', () => {
    const output = runShuviCommand('inspect', [
      'test/fixtures/inspect',
      '--verbose'
    ]);
    expect(output).toMatch(`'process.env.NODE_ENV': '"development"'`);
    expect(output).toMatch(`__NAME__: '"shuvi/client"'`);
    expect(output).toMatch(`__NAME__: '"shuvi/server"'`);
    expect(output).toMatch(`__DEV__: true`);

    const output2 = runShuviCommand('inspect', [
      'test/fixtures/inspect',
      '--mode=production',
      '--verbose'
    ]);
    expect(output2).toMatch(`'process.env.NODE_ENV': '"production"'`);
    expect(output2).toMatch(`__NAME__: '"shuvi/client"'`);
    expect(output2).toMatch(`__NAME__: '"shuvi/server"'`);
    expect(output2).toMatch(`__DEV__: false`);
  });
});
