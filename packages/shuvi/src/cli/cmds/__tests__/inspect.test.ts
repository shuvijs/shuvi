import { runShuviCommand, runShuviCommandWithSpawn } from 'shuvi-test-utils';

describe('shuvi inspect command', () => {
  test('should be log webpack config correctly', async () => {
    const output = runShuviCommand('inspect', ['test/fixtures/inspect']);
    expect(output).toMatch(`mode: 'development'`);
    expect(output).toMatch(`name: 'shuvi/server'`);
    expect(output).toMatch(`name: 'shuvi/client'`);
    try {
      const { code, message } = await runShuviCommandWithSpawn('inspect', [
        'test/fixtures/inspect'
      ]);
      expect(code).toBe(0);
      expect(message).toMatch(`mode: 'development'`);
      expect(message).toMatch(`name: 'shuvi/server'`);
      expect(message).toMatch(`name: 'shuvi/client'`);
    } catch (e) {
      expect(e.code).toBe(1);
      expect(e.message).toMatch('No such directory exists as the project root');
    }
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

  test('should exit process when dir is not exist', async () => {
    expect(() => runShuviCommand('inspect', ['test/fixtures/xxx'])).toThrow(
      '> No such directory exists as the project root'
    );
    try {
      await runShuviCommandWithSpawn('inspect', ['test/fixtures/xxx']);
    } catch (e) {
      expect(e.code).toBe(1);
      expect(e.message).toMatch('No such directory exists as the project root');
    }
  });
});
