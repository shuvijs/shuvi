import { htmlEscapeContent, htmlEscapeJsonString } from '../htmlescape';

describe('htmlEscapeContent', () => {
  test('with ampersands should escape', function () {
    const evilString = 'test&test';
    expect(htmlEscapeContent(evilString)).toBe('test&amp;test');
  });

  test('with greater-than should escape', function () {
    const evilString = 'test>test';
    expect(htmlEscapeContent(evilString)).toBe('test&gt;test');
  });

  test('with less-than should escape', function () {
    const evilString = 'test<test';
    expect(htmlEscapeContent(evilString)).toBe('test&lt;test');
  });

  test('with single-quote should escape', function () {
    const evilString = "test''test";
    expect(htmlEscapeContent(evilString)).toBe('test&#39;&#39;test');
  });

  test('with double-quote should escape', function () {
    const evilString = 'test""test';
    expect(htmlEscapeContent(evilString)).toBe('test&quot;&quot;test');
  });

  test('with less-than should escape', function () {
    const evilString = 'test<test';
    expect(htmlEscapeContent(evilString)).toBe('test&lt;test');
  });

  test('should not escpe', () => {
    const normalString = 'test TEST 1234 !@#$%^*()_+`| test';
    expect(htmlEscapeContent(normalString)).toBe(normalString);
  });
});

describe('htmlEscapeJsonString', () => {
  test('with angle brackets should escape', function () {
    const evilObj = { evil: '<script></script>' };
    expect(htmlEscapeJsonString(JSON.stringify(evilObj))).toBe(
      '{"evil":"\\u003cscript\\u003e\\u003c/script\\u003e"}'
    );
  });

  test('with angle brackets should parse back', function () {
    const evilObj = { evil: '<script></script>' };
    expect(JSON.parse(htmlEscapeJsonString(JSON.stringify(evilObj)))).toEqual(
      evilObj
    );
  });

  test('with ampersands should escape', function () {
    const evilObj = { evil: '&' };
    expect(htmlEscapeJsonString(JSON.stringify(evilObj))).toBe(
      '{"evil":"\\u0026"}'
    );
  });

  test('with ampersands should parse back', function () {
    const evilObj = { evil: '&' };
    expect(JSON.parse(htmlEscapeJsonString(JSON.stringify(evilObj)))).toEqual(
      evilObj
    );
  });

  test('with "LINE SEPARATOR" and "PARAGRAPH SEPARATOR" should escape', function () {
    const evilObj = { evil: '\u2028\u2029' };
    expect(htmlEscapeJsonString(JSON.stringify(evilObj))).toBe(
      '{"evil":"\\u2028\\u2029"}'
    );
  });

  test('with "LINE SEPARATOR" and "PARAGRAPH SEPARATOR" should parse back', function () {
    const evilObj = { evil: '\u2028\u2029' };
    expect(JSON.parse(htmlEscapeJsonString(JSON.stringify(evilObj)))).toEqual(
      evilObj
    );
  });
});
