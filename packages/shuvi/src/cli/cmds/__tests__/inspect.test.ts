import { createCliTestProject } from 'shuvi-test-utils';

describe('shuvi inspect command', () => {
  test('should be log webpack config correctly', async () => {
    try {
      const project = createCliTestProject('test/fixtures/inspect');
      const { message } = await project.run('inspect', [], {
        env: {
          ...process.env,
          __DISABLE_HIGHLIGHT__: 'true'
        }
      });
      expect(message).toMatch(`mode: 'development'`);
      expect(message).toMatch(`name: 'shuvi/server'`);
      expect(message).toMatch(`name: 'shuvi/client'`);
      expect(message).not.toMatch(`__NAME__: '"shuvi/client"'`);
      expect(message).not.toMatch(`__NAME__: '"shuvi/server"'`);
    } catch (e) {
      expect(e.code).toBe(1);
      expect(e.message).toMatch('No such directory exists as the project root');
    }
  });

  test('can specify --mode', async () => {
    const project = createCliTestProject('test/fixtures/inspect');
    const { message } = await project.run('inspect', ['--mode=production'], {
      env: {
        ...process.env,
        __DISABLE_HIGHLIGHT__: 'true'
      }
    });
    expect(message).toMatch(`mode: 'production'`);
    expect(message).toMatch(`name: 'shuvi/server'`);
    expect(message).toMatch(`name: 'shuvi/client'`);
  });

  test('can specify --verbose', async () => {
    const project = createCliTestProject('test/fixtures/inspect');
    const { message } = await project.run('inspect', ['--verbose'], {
      env: {
        ...process.env,
        __DISABLE_HIGHLIGHT__: 'true'
      }
    });
    expect(message).toMatch(`'process.env.NODE_ENV': '"development"'`);
    expect(message).toMatch(`__NAME__: '"shuvi/client"'`);
    expect(message).toMatch(`__NAME__: '"shuvi/server"'`);
    expect(message).toMatch(`__DEV__: true`);

    const project2 = createCliTestProject('test/fixtures/inspect');
    const { message: message2 } = await project2.run(
      'inspect',
      ['--mode=production', '--verbose'],
      {
        env: {
          ...process.env,
          __DISABLE_HIGHLIGHT__: 'true'
        }
      }
    );
    expect(message2).toMatch(`'process.env.NODE_ENV': '"production"'`);
    expect(message2).toMatch(`__NAME__: '"shuvi/client"'`);
    expect(message2).toMatch(`__NAME__: '"shuvi/server"'`);
    expect(message2).toMatch(`__DEV__: false`);
  });

  test('should exit process when dir is not exist', async () => {
    try {
      const project = createCliTestProject('test/fixtures/xxx');
      await project.run('inspect');
    } catch (e) {
      expect(e.code).toBe(1);
      expect(e.message).toMatch('No such directory exists as the project root');
    }
  });
});
