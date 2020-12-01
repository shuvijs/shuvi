import { stringifyTag } from '../htmlTag';

describe('htmlTag', () => {
  describe('stringifyTag', () => {
    it('should escape html for attrs except innerHTML', () => {
      expect(
        stringifyTag({
          attrs: {
            lang: '"/><img%20src=defaceurl"> '
          },
          innerHTML: '"/><img%20src=defaceurl"> ',
          tagName: 'html'
        })
      ).toMatchInlineSnapshot(
        `"<html lang=\\"&quot;/&gt;&lt;img%20src=defaceurl&quot;&gt; \\">\\"/><img%20src=defaceurl\\"> </html>"`
      );
    });
  });
});
