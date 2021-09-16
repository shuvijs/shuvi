import parseDynamicPath from '../parseDynamicPath';

describe('parse dynamic path', () => {
  test('should work', async () => {
    expect(parseDynamicPath('/')).toBe('/');
    expect(parseDynamicPath('/sss')).toBe('/sss');
    expect(parseDynamicPath('/[sss]')).toBe('/:sss');
    expect(parseDynamicPath('/[sss]/[[aaa]]')).toBe('/:sss/:aaa?');
    expect(parseDynamicPath('/[sss]/[...aaa]')).toBe('/:sss/:aaa+');
    expect(parseDynamicPath('/[sss]/[[...aaa]]')).toBe('/:sss/:aaa*');
    expect(parseDynamicPath('/s-[sss]/a-[[...aaa]]')).toBe('/s-:sss/a-:aaa*');
  });
});
