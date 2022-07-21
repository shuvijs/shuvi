import { urlToRequest } from '../codegen';

describe('codegen/urlToRequest', () => {
  it('should be file protocol for windows absolute path', () => {
    expect(urlToRequest('C:\\foo\\bar.js')).toBe('file://c:/foo/bar.js');
    expect(urlToRequest('C:\\\\foo\\bar.js')).toBe('file://c:/foo/bar.js');
  });

  it('should turn all "\\" to "/"', () => {
    expect(urlToRequest('foo\\bar.js')).toBe('foo/bar.js');
  });
});
