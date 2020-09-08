import { matchPath } from '../matchPath';

describe('matchPath', () => {
  it('should match given string', () => {
    expect(matchPath('', '')).toStrictEqual({
      params: {},
      path: '',
      pathname: ''
    });

    expect(matchPath('/*', '/123')).toStrictEqual({
      params: {
        '*': '123'
      },
      path: '/*',
      pathname: '/123'
    });

    expect(
      matchPath('/caseInsensitive/:id', '/caseinsensitive/123')
    ).toStrictEqual({
      params: {
        id: '123'
      },
      path: '/caseInsensitive/:id',
      pathname: '/caseinsensitive/123'
    });

    expect(matchPath('nested/1/2/3', '/nested/1/2/3')).toStrictEqual({
      params: {},
      path: 'nested/1/2/3',
      pathname: '/nested/1/2/3'
    });
  });

  it('should match given pattern', () => {
    expect(
      matchPath({ path: '', caseSensitive: true, end: true }, '')
    ).toStrictEqual({
      params: {},
      path: '',
      pathname: ''
    });

    expect(
      matchPath(
        { path: '/asd/:id', caseSensitive: true, end: true },
        '/asd/123'
      )
    ).toStrictEqual({
      params: {
        id: '123'
      },
      path: '/asd/:id',
      pathname: '/asd/123'
    });

    expect(
      matchPath(
        { path: '/withEndFalse/:id/', caseSensitive: true, end: false },
        '/withEndFalse/123/thisWillMatch'
      )
    ).toStrictEqual({
      params: {
        id: '123'
      },
      path: '/withEndFalse/:id/',
      pathname: '/withEndFalse/123'
    });

    expect(
      matchPath(
        {
          path: '/withMultipleParams/:id/:id2',
          caseSensitive: true,
          end: false
        },
        '/withMultipleParams/123/thisWillMatch'
      )
    ).toStrictEqual({
      params: {
        id: '123',
        id2: 'thisWillMatch'
      },
      path: '/withMultipleParams/:id/:id2',
      pathname: '/withMultipleParams/123/thisWillMatch'
    });
  });

  it('should not match given string', () => {
    expect(matchPath('/qwe', '/')).toBeNull();

    expect(matchPath('/nested/1/2/3', '/incorrect/1/2/3')).toBeNull();
  });

  it('should not match given pattern', () => {
    expect(matchPath({ path: '/notMatch' }, '/')).toBeNull();

    expect(
      matchPath(
        { path: '/caseSensitive', caseSensitive: true },
        '/casesensitive'
      )
    ).toBeNull();

    expect(
      matchPath(
        { path: '/withEnd', caseSensitive: true, end: true },
        '/withEnd/something'
      )
    ).toBeNull();
  });
});
