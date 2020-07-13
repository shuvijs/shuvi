import { runShuviCommand } from 'shuvi-test-utils';

describe('shuvi inspect command', () => {
  test('should be log webpack config correctly', async () => {
    try {
      const { code, message } = await runShuviCommand('inspect', [
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

  test('can specify --mode', async () => {
    const { code, message } = await runShuviCommand('inspect', [
      'test/fixtures/inspect',
      '--mode=production'
    ]);
    expect(code).toBe(0);
    expect(message).toMatch(`mode: 'production'`);
    expect(message).toMatch(`name: 'shuvi/server'`);
    expect(message).toMatch(`name: 'shuvi/client'`);
  });

  test('can specify --verbose', async () => {
    const { code, message } = await runShuviCommand('inspect', [
      'test/fixtures/inspect',
      '--verbose'
    ]);
    expect(code).toBe(0);
    expect(message).toMatch(`'process.env.NODE_ENV': '"development"'`);
    expect(message).toMatch(`__NAME__: '"shuvi/client"'`);
    expect(message).toMatch(`__NAME__: '"shuvi/server"'`);
    expect(message).toMatch(`__DEV__: true`);

    const { code: code2, message: message2 } = await runShuviCommand(
      'inspect',
      ['test/fixtures/inspect', '--mode=production', '--verbose']
    );
    expect(code2).toBe(0);
    expect(message2).toMatch(`'process.env.NODE_ENV': '"production"'`);
    expect(message2).toMatch(`__NAME__: '"shuvi/client"'`);
    expect(message2).toMatch(`__NAME__: '"shuvi/server"'`);
    expect(message2).toMatch(`__DEV__: false`);
  });

  test('should exit process when dir is not exist', async () => {
    try {
      await runShuviCommand('inspect', ['test/fixtures/xxx']);
    } catch (e) {
      expect(e.code).toBe(1);
      expect(e.message).toMatch('No such directory exists as the project root');
    }
  });
});
