import { parseDynamicPath } from '../helpers';

describe('helpers/parseDynamicPath', () => {
  test('should not parse static', async () => {
    expect(parseDynamicPath('/')).toBe('/');
    expect(parseDynamicPath('/sss')).toBe('/sss');
  });

  test('should parse $', async () => {
    expect(parseDynamicPath('/$sss')).toBe('/:sss');
    expect(parseDynamicPath('/sss/$sss')).toBe('/sss/:sss');
    expect(parseDynamicPath('/sss/$sss/$a')).toBe('/sss/:sss/:a');
    expect(parseDynamicPath('/a-$sss-b/c')).toBe('/a-:sss-b/c');
    expect(parseDynamicPath('/a-$sss-$b/c')).toBe('/a-:sss-:b/c');
  });

  test('should parse $$', async () => {
    expect(parseDynamicPath('/$$sss')).toBe('/:sss?');
    expect(parseDynamicPath('/sss/$$sss')).toBe('/sss/:sss?');
    expect(parseDynamicPath('/sss/$$sss/$$a')).toBe('/sss/:sss?/:a?');
    expect(parseDynamicPath('/a-$$sss-$$b/c')).toBe('/a-:sss?-:b?/c');
  });

  test('should parse mix $ and $$', async () => {
    expect(parseDynamicPath('/$ss/$$sss')).toBe('/:ss/:sss?');
    expect(parseDynamicPath('/a-$$sss-$b/c')).toBe('/a-:sss?-:b/c');
  });

  test('should parse end with $', async () => {
    expect(parseDynamicPath('/$sss/$')).toBe('/:sss/*');
    expect(parseDynamicPath('/$$sss/$')).toBe('/:sss?/*');
    expect(parseDynamicPath('/sss$')).toBe('/sss*');
    expect(parseDynamicPath('/s-$sss/a-$')).toBe('/s-:sss/a-*');
  });
});
