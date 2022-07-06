import { matchPathname } from '../matchPathname';

describe('matchPathname', () => {
  it('should match given string', () => {
    expect(matchPathname('', '')).toStrictEqual({
      params: {},
      path: '',
      pathname: ''
    });

    expect(matchPathname('/*', '/*')).toStrictEqual({
      params: {},
      path: '/*',
      pathname: '/*'
    });

    expect(matchPathname('/:other(.*)', '/123/any')).toStrictEqual({
      params: {
        other: '123/any'
      },
      path: '/:other(.*)',
      pathname: '/123/any'
    });

    expect(
      matchPathname('/caseInsensitive/:id', '/caseinsensitive/123')
    ).toStrictEqual({
      params: {
        id: '123'
      },
      path: '/caseInsensitive/:id',
      pathname: '/caseinsensitive/123'
    });

    expect(matchPathname('nested/1/2/3', '/nested/1/2/3')).toStrictEqual({
      params: {},
      path: 'nested/1/2/3',
      pathname: '/nested/1/2/3'
    });
  });

  it('should match given pattern', () => {
    expect(
      matchPathname({ path: '', caseSensitive: true, end: true }, '')
    ).toStrictEqual({
      params: {},
      path: '',
      pathname: ''
    });

    expect(
      matchPathname(
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
      matchPathname(
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
      matchPathname(
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
    expect(matchPathname('/qwe', '/')).toBeNull();

    expect(matchPathname('/nested/1/2/3', '/incorrect/1/2/3')).toBeNull();
  });

  it('should not match given pattern', () => {
    expect(matchPathname({ path: '/notMatch' }, '/')).toBeNull();

    expect(
      matchPathname(
        { path: '/caseSensitive', caseSensitive: true },
        '/casesensitive'
      )
    ).toBeNull();

    expect(
      matchPathname(
        { path: '/withEnd', caseSensitive: true, end: true },
        '/withEnd/something'
      )
    ).toBeNull();
  });

  it('should work with optional params', () => {
    expect(matchPathname({ path: '/:optional?' }, '/optional')).toStrictEqual({
      params: { optional: 'optional' },
      path: '/:optional?',
      pathname: '/optional'
    });
  });

  it('should not log warning when optional params is empty', () => {
    jest.spyOn(console, 'warn');

    expect(matchPathname({ path: '/:optional?' }, '/')).toStrictEqual({
      params: { optional: '' },
      path: '/:optional?',
      pathname: '/'
    });

    expect(console.warn).toBeCalledTimes(0);
  });
});
