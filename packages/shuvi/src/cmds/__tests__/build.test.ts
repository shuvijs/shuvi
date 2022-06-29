import { createCliTestProject } from 'shuvi-test-utils';
import {
  BUILD_CLIENT_ASSET_DIR,
  BUILD_DEFAULT_DIR
} from '@shuvi/service/lib/constants';

jest.setTimeout(5 * 60 * 1000);

describe('shuvi build command', () => {
  test('should build app correctly', async () => {
    const project = createCliTestProject('test/fixtures/inspect');
    project.clear('dist');
    expect(
      project.exist(
        `dist/${BUILD_DEFAULT_DIR}/${BUILD_CLIENT_ASSET_DIR}/static`
      )
    ).toBeFalsy();
    const { message } = await project.run('build');
    expect(
      project.exist(
        `dist/${BUILD_DEFAULT_DIR}/${BUILD_CLIENT_ASSET_DIR}/static`
      )
    ).toBeTruthy();
    expect(
      project.exist(`dist/${BUILD_DEFAULT_DIR}/analyze/client.html`)
    ).toBeFalsy();
    expect(message).toMatch('Build successfully!');
  });

  test('should generate html file to analyze webpack bundle by specify --analyze flag', async () => {
    const project = createCliTestProject('test/fixtures/inspect');
    project.clear('dist');
    const { message } = await project.run('build', ['--analyze']);
    expect(
      project.exist(
        `dist/${BUILD_DEFAULT_DIR}/${BUILD_CLIENT_ASSET_DIR}/static`
      )
    ).toBeTruthy();
    expect(
      project.exist(`dist/${BUILD_DEFAULT_DIR}/analyze/client.html`)
    ).toBeTruthy();
    expect(message).toMatch('Build successfully!');
  });

  test('should exit process when dir is not exist', async () => {
    const project = createCliTestProject('test/fixtures/xxx');
    try {
      await project.run('build');
    } catch (e: any) {
      expect(e.code).toBe(1);
      expect(e.message).toMatch('No such directory exists as the project root');
    }
  });
});
