// fork by vue router 4, remove 'Path parser' and 'tokensToParser' test
import { tokenizePath } from '../pathTokenizer';
import { MatchPathParams } from '../pathParserRanker';
import { tokensToParser } from '../pathParserRanker';

describe('Path parser', () => {

  describe('parsing urls', () => {
    function matchParams(
      path: string,
      pathToTest: string,
      params: ReturnType<ReturnType<typeof tokensToParser>['parse']> extends infer P
        ?
        P extends MatchPathParams ?  P['params'] : null
        : null,
      options?: Parameters<typeof tokensToParser>[1]
    ) {
      const pathParser = tokensToParser(tokenizePath(path), options);

      const mathResult = pathParser.parse(pathToTest);

      let matchParams = null;

      if (mathResult) {
        const { params } = mathResult;
        matchParams = params
      }

      expect(matchParams).toEqual(params);
    }

    it('returns null if no match', () => {
      matchParams('/home', '/', null);
    });

    it('allows an empty root', () => {
      matchParams('', '/', {});
    });

    it('makes the difference between "" and "/" when strict', () => {
      matchParams('/foo', '/foo/', null, { strict: true });
      matchParams('/foo/', '/foo', null, { strict: true });
    });

    it('allows a trailing slash', () => {
      matchParams('/home', '/home/', {});
      matchParams('/a/b', '/a/b/', {});
    });

    it('enforces a trailing slash', () => {
      matchParams('/home/', '/home', null, { strict: true });
    });

    it('allow a trailing slash in repeated params', () => {
      matchParams('/a/:id+', '/a/b/c/d/', { id: ['b', 'c', 'd'] });
      matchParams('/a/:id*', '/a/b/c/d/', { id: ['b', 'c', 'd'] });
      matchParams('/a/:id*', '/a/', { id: '' });
      matchParams('/a/:id*', '/a', { id: '' });
    });

    it('allow no slash', () => {
      matchParams('/home', '/home/', null, { strict: true });
      matchParams('/home', '/home', {}, { strict: true });
    });

    it('is insensitive by default', () => {
      matchParams('/home', '/HOMe', {});
    });

    it('can be sensitive', () => {
      matchParams('/home', '/HOMe', null, { sensitive: true });
      matchParams('/home', '/home', {}, { sensitive: true });
    });

    it('can not match the beginning', () => {
      matchParams('/home', '/other/home', null, { start: true });
      matchParams('/home', '/other/home', {}, { start: false });
    });

    it('can not match the end', () => {
      matchParams('/home', '/home/other', null, { end: true });
      matchParams('/home', '/home/other', {}, { end: false });
    });

    it('should not match optional params + static without leading slash', () => {
      matchParams('/a/:p?-b', '/a-b', null);
      matchParams('/a/:p?-b', '/a/-b', { p: '' });
      matchParams('/a/:p?-b', '/a/e-b', { p: 'e' });
    });

    it('returns an empty object with no keys', () => {
      matchParams('/home', '/home', {});
    });

    it('param single', () => {
      matchParams('/:id', '/a', { id: 'a' });
    });

    it('param combined', () => {
      matchParams('/hey:a', '/heyedu', {
        a: 'edu'
      });
    });

    // TODO: better syntax? like /a/{b-:param}+
    // also to allow repeatable because otherwise groups are meaningless
    it('groups (extract a part of the param)', () => {
      matchParams('/a/:a(?:b-([^/]+\\)?)', '/a/b-one', {
        a: 'one'
      });
      matchParams('/a/:a(?:b-([^/]+\\)?)', '/a/b-', {
        a: ''
      });
      // non optional
      matchParams('/a/:a(?:b-([^/]+\\))', '/a/b-one', {
        a: 'one'
      });
    });

    it('catch all', () => {
      matchParams('/:rest(.*)', '/a/b/c', { rest: 'a/b/c' });
      matchParams('/:rest(.*)/no', '/a/b/c/no', { rest: 'a/b/c' });
    });

    it('catch all non-greedy', () => {
      matchParams('/:rest(.*?)/b/:other(.*)', '/a/b/c/b/d', {
        rest: 'a',
        other: 'c/b/d'
      });
    });

    it('param multiple', () => {
      matchParams('/:a-:b-:c', '/one-two-three', {
        a: 'one',
        b: 'two',
        c: 'three'
      });
    });

    it('param optional', () => {
      matchParams('/:a?', '/one', { a: 'one' });
      matchParams('/:a*', '/one', { a: ['one'] });
    });

    it('empty param optional', () => {
      matchParams('/:a?', '/', { a: '' });
      matchParams('/:a*', '/', { a: '' });
    });

    it('static then empty param optional', () => {
      matchParams('/a/:a?', '/a', { a: '' });
      matchParams('/a/:a?', '/a/a', { a: 'a' });
      matchParams('/a/:a?', '/a/a/', { a: 'a' });
      matchParams('/a/:a?', '/a/', { a: '' });
      matchParams('/a/:a*', '/a', { a: '' });
      matchParams('/a/:a*', '/a/', { a: '' });
      matchParams('/a/:a(.*)', '/a', null);
      matchParams('/a/:a(.*)', '/a/', { a: '' });
      matchParams('/a/-:a*', '/a/-', { a: '' });
      matchParams('/a/-:a*', '/a/-/b/c', null);
      matchParams('/a/-:a*', '/a/-b/c', { a: ['b', 'c'] });
      matchParams('/a/-:a(.*)', '/a/-b/c', { a: 'b/c' });
    });

    it('static then param optional', () => {
      matchParams('/one/:a?', '/one/two', { a: 'two' });
      matchParams('/one/:a?', '/one/', { a: '' });
      // can only match one time
      matchParams('/one/:a?', '/one/two/three', null);
      matchParams('/one/:a*', '/one/two', { a: ['two'] });
    });

    it('param optional followed by static', () => {
      matchParams('/:a?/one', '/two/one', { a: 'two' });
      // since the first one is optional
      matchParams('/:a?/one', '/one', { a: '' });
      matchParams('/:a?/one', '/two', null);
      // can only match one time
      matchParams('/:a?/one', '/two/three/one', null);
      matchParams('/:a*/one', '/two/one', { a: ['two'] });
    });

    it('param repeatable', () => {
      matchParams('/:a+', '/one/two', {
        a: ['one', 'two']
      });
      matchParams('/:a*', '/one/two', {
        a: ['one', 'two']
      });
    });

    it('param repeatable with static', () => {
      matchParams('/one/:a+', '/one/two', {
        a: ['two']
      });
      matchParams('/one/:a+', '/one/two/three', {
        a: ['two', 'three']
      });
      matchParams('/one/:a*', '/one/two', {
        a: ['two']
      });
      matchParams('/one/:a*', '/one/two/three', {
        a: ['two', 'three']
      });
    });

    // end of parsing urls
  });

  describe('generating urls', () => {
    function matchStringify(
      path: string,
      params: Exclude<ReturnType<ReturnType<typeof tokensToParser>['parse']>,
        null>['params'],
      expectedUrl: string,
      options?: Parameters<typeof tokensToParser>[1]
    ) {
      const pathParser = tokensToParser(tokenizePath(path), options);

      expect(pathParser.stringify(params)).toEqual(expectedUrl);
    }

    it('no params one segment', () => {
      matchStringify('/home', {}, '/home');
    });

    it('works with trailing slash', () => {
      matchStringify('/home/', {}, '/home/');
      matchStringify('/home/', {}, '/home/', { strict: true });
    });

    it('single param one segment', () => {
      matchStringify('/:id', { id: 'one' }, '/one');
    });

    it('params with custom regexp', () => {
      matchStringify('/:id(\\d+)-:w(\\w+)', { id: '2', w: 'hey' }, '/2-hey');
    });

    it('multiple param one segment', () => {
      matchStringify('/:a-:b', { a: 'one', b: 'two' }, '/one-two');
    });

    it('repeatable params+', () => {
      matchStringify('/:a+', { a: ['one', 'two'] }, '/one/two');
    });

    it('repeatable params+ with extra segment', () => {
      matchStringify('/:a+/other', { a: ['one', 'two'] }, '/one/two/other');
    });

    it('repeatable params*', () => {
      matchStringify('/:a*', { a: ['one', 'two'] }, '/one/two');
    });

    it('static then optional param?', () => {
      matchStringify('/a/:a?', { a: '' }, '/a');
      matchStringify('/a/:a?', {}, '/a');
    });

    it('optional param?', () => {
      matchStringify('/:a?/other', { a: '' }, '/other');
      matchStringify('/:a?/other', {}, '/other');
    });

    it('optional param? with static segment', () => {
      matchStringify('/b-:a?/other', { a: '' }, '/b-/other');
      matchStringify('/b-:a?/other', {}, '/b-/other');
    });

    it('starting optional param? with static segment should not drop the initial /', () => {
      matchStringify('/a/:a?-other/other', { a: '' }, '/a/-other/other');
      matchStringify('/a/:a?-other/other', {}, '/a/-other/other');
      matchStringify('/a/:a?-other/other', { a: 'p' }, '/a/p-other/other');
    });

    it('optional param*', () => {
      matchStringify('/:a*/other', { a: '' }, '/other');
      matchStringify('/:a*/other', { a: [] }, '/other');
      matchStringify('/:a*/other', {}, '/other');
    });

    it('*', () => {
      matchStringify('/:other(.*)', {'other': 'any/other'}, '/any/other');
    });

    // end of generating urls
  });
});
