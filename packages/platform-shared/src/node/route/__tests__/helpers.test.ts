import { parseDynamicPath } from '../helpers';

describe('helpers/parseDynamicPath', () => {
  test('should work', async () => {
    expect(parseDynamicPath('/')).toBe('/');
    expect(parseDynamicPath('/sss')).toBe('/sss');
    expect(parseDynamicPath('/sss/$sss')).toBe('/sss/:sss');
    expect(parseDynamicPath('/$sss')).toBe('/:sss');
    expect(parseDynamicPath('/$sss/$')).toBe('/:sss/*');
    expect(parseDynamicPath('/sss$')).toBe('/sss*');
    expect(parseDynamicPath('/a-$sss-b/c')).toBe('/a-:sss-b/c');
    expect(parseDynamicPath('/s-$sss/a-$')).toBe('/s-:sss/a-*');
  });
});
