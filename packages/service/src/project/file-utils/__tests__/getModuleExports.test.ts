import { getExports } from '../getModuleExports';
import { trim } from 'shuvi-test-utils/shared';

describe('getModuleExports', () => {
  test('export function declaration', () => {
    const result = getExports(trim`
    export function a() {};
  `);

    expect(result).toEqual(['a']);
  });

  test('export variable declaration', () => {
    const result = getExports(trim`
    export const a = 1;
  `);

    expect(result).toEqual(['a']);
  });

  test('reexport', () => {
    const result = getExports(trim`
    import { a } from 'b';
    export { a };
  `);

    expect(result).toEqual(['a']);
  });
});
