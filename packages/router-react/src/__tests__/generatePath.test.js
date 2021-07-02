import { generatePath } from '..';

describe('generatePath', () => {
  describe('with no params', () => {
    it('returns the unmodified path', () => {
      expect(generatePath('/')).toBe('/');
      expect(generatePath('/courses')).toBe('/courses');
    });
  });

  describe('with params', () => {
    it('returns the path without those params interpolated', () => {
      expect(generatePath('/courses/:id', { id: 'routing' })).toBe(
        '/courses/routing'
      );
      expect(generatePath('/courses/:_(.*)', { _: 'routing/grades' })).toBe(
        '/courses/routing/grades'
      );
      expect(generatePath('/courses/:_*', { _: ['routing', 'grades'] })).toBe(
        '/courses/routing/grades'
      );
      expect(generatePath(':other(.*)', { other: 'routing/grades' })).toBe(
        '/routing/grades'
      );
    });
  });

  describe('with extraneous params', () => {
    it('ignores them', () => {
      expect(generatePath('/', { course: 'routing' })).toBe('/');
      expect(generatePath('/courses', { course: 'routing' })).toBe('/courses');
    });
  });

  describe('with missing params', () => {
    it('throws an error', () => {
      expect(() => {
        generatePath('/:lang/login', {});
      }).toThrow(/Missing required param \"lang\"/);
    });
  });

  describe('with a missing splat', () => {
    it('omits the splat and trims the trailing slash', () => {
      expect(generatePath('/courses/:_(.*)', { _: '' })).toBe('/courses/');
      expect(generatePath('/courses/:_*', { _: '' })).toBe('/courses');
      expect(generatePath('/courses/:_*', {})).toBe('/courses');
      expect(generatePath('/courses/:_(.*)?', {})).toBe('/courses');
    });
  });
});
