import { getTypeScriptInfo } from '../detectTypescript';
import { resolveFixture } from './utils';

describe('detectTypescript', () => {
  test('should work with typescript project', () => {
    const result = getTypeScriptInfo(resolveFixture('typescript-project'));
    expect(result.useTypeScript).toBe(true);
    expect(result.tsConfigPath).toContain(
      '/fixtures/typescript-project/tsconfig.json'
    );
    expect(result.typeScriptPath).toContain('/node_modules/typescript/');
  });

  test('should work with javascript project', () => {
    const result = getTypeScriptInfo(resolveFixture('javascript-project'));
    expect(result.useTypeScript).toBe(false);
    expect(result.typeScriptPath).toBeUndefined();
    expect(result.tsConfigPath).toBeUndefined();
  });
});
