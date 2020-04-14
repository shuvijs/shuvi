import { escapeRegExp } from '../escapeRegExp';

describe('escapeRegExp', () => {
  test('main', () => {
    expect(escapeRegExp('test \\ - /  ^ $ * + ? . ( ) | { } [ ] ABC 123')).toBe(
      'test \\\\ \\- \\/  \\^ \\$ \\* \\+ \\? \\. \\( \\) \\| \\{ \\} \\[ \\] ABC 123'
    );
  });
});
