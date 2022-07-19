import { isIgnore } from '../helpers';

describe('ignore route test', function () {
  it('should ignored all routes when get */**', function () {
    const result1 = isIgnore(['**/*'], 'asd');
    const result2 = isIgnore(['**/*'], 'b');
    expect(result1 && result2).toBeTruthy();
  });

  it('should ignored correct result', function () {
    const globs = ['b/*'];
    const result1 = isIgnore(globs, 'asd');
    const result2 = isIgnore(globs, 'b');

    expect(!result1 && result2);
  });

  it('should ignored correct result when get tree path', function () {
    const globs = ['c/*'];
    const result1 = isIgnore(globs, 'c');
    const result2 = isIgnore(globs, 'c/a');
    const result3 = isIgnore(globs, 'c/a/d');

    expect(!result1 && result2 && result3);
  });
});
