import { getContentProxyObj } from '../';
import { trim } from 'shuvi-test-utils/shared';

describe('proxyObj', () => {
  test('should work', () => {
    const result = getContentProxyObj({
      a: 'b',
      c: 'd',
      [`e='e'`]: undefined
    });

    expect(trim(result)).toBe(
      trim(`
    const proxyObj = {};
    module.exports = proxyObj;
    proxyObj.a  = function() {return require(\"b\")};
    proxyObj.c  = function() {return require(\"d\")};
    proxyObj.e='e' ;
        `)
    );
  });
});
