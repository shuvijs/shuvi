import React from 'react';
import { File, Dir } from '..';
import { renderOnce } from '../renderer';
import { resetFs, recursiveReadDir } from './utils';

jest.mock('fs');

afterEach(resetFs);

describe('renderer', () => {
  describe('renderOnce', () => {
    test('simple', async () => {
      await renderOnce(
        <Dir name="a">
          <File name="a1" content="test" />
          <File name="a2" content="test" />
        </Dir>,
        '/'
      );

      const files = await recursiveReadDir('/');
      expect(files).toEqual(['a/a1', 'a/a2']);
    });

    test('fragment', async () => {
      await renderOnce(
        <>
          <File name="a" content="test" />
          <Dir name="b">
            <File name="b1" content="test" />
          </Dir>
        </>,
        '/'
      );

      const files = await recursiveReadDir('/');
      expect(files).toEqual(['a', 'b/b1']);
    });

    test('shuold work when duplicated dir', async () => {
      await renderOnce(
        <>
          <Dir name="a">
            <File name="a1" content="test" />
          </Dir>
          <Dir name="a">
            <File name="a2" content="test" />
          </Dir>
        </>,
        '/'
      );

      const files = await recursiveReadDir('/');
      expect(files).toEqual(['a/a1', 'a/a2']);
    });
  });
});
