/**
 * @jest-environment jsdom
 */

import * as React from 'react';
import {
  // getByText,
  render as testLibRender,
  // waitFor,
  cleanup
  // act
} from '@testing-library/react';
import { Head, HeadManager, HeadManagerContext } from '../index';
import { SHUVI_HEAD_ATTRIBUTE } from '../head';

function HeadProvider({ children }: any) {
  const headManager = new HeadManager();
  return (
    <HeadManagerContext.Provider value={headManager.updateHead}>
      {children}
    </HeadManagerContext.Provider>
  );
}

function render(el: React.ReactElement) {
  return testLibRender(el, { wrapper: HeadProvider });
}

function serverRender(el: React.ReactElement) {
  return testLibRender(el);
}

async function waitEffect() {
  await Promise.resolve();
}

describe('Head', () => {
  let headElement: HTMLHeadElement;

  beforeEach(() => {
    headElement =
      headElement || document.head || document.querySelector('head');
    // resets DOM after each run
    headElement.innerHTML = '';
  });
  afterEach(cleanup);

  describe('title tag', () => {
    test('update page title', async () => {
      render(
        <Head>
          <title>Test Title</title>
        </Head>
      );
      await waitEffect();
      expect(document.title).toEqual('Test Title');
    });

    test('update page title and allows children containing expressions', async () => {
      const someValue = 'Some Great Title';
      render(
        <Head>
          <title>Title: {someValue}</title>
        </Head>
      );
      await waitEffect();
      expect(document.title).toEqual('Title: Some Great Title');
    });

    test('update page title with multiple children', async () => {
      render(
        <div>
          <Head>
            <title>Test Title</title>
          </Head>
          <Head>
            <title>Child One Title</title>
          </Head>
          <Head>
            <title>Child Two Title</title>
          </Head>
        </div>
      );
      await waitEffect();
      expect(document.title).toEqual('Child Two Title');
    });

    test('set title based on deepest nested component', async () => {
      render(
        <div>
          <Head>
            <title>Main Title</title>
          </Head>
          <div>
            <Head>
              <title>Nested Title</title>
            </Head>
          </div>
        </div>
      );
      await waitEffect();
      expect(document.title).toEqual('Nested Title');
    });

    test('set title using component with a defined title', async () => {
      render(
        <div>
          <Head>
            <title>Main Title</title>
          </Head>
          <Head />
        </div>
      );
      await waitEffect();
      expect(document.title).toEqual('Main Title');
    });

    test('title with prop itemProp', async () => {
      render(
        <Head>
          <title itemProp="name">Test Title with itemProp</title>
        </Head>
      );

      await waitEffect();
      expect(document.title).toEqual('Test Title with itemProp');
      const $title = document.getElementsByTagName('title')[0];
      expect($title.getAttribute('itemprop')).toEqual('name');
    });

    test('retains existing title tag when no title tag is defined', async () => {
      headElement.innerHTML += `<title>Existing Title</title>`;

      render(
        <Head>
          <meta name="keywords" content="stuff" />
        </Head>
      );
      await waitEffect();
      expect(document.title).toEqual('Existing Title');
    });

    test('clears title tag if empty title is defined', async () => {
      render(
        <Head>
          <title>Existing Title</title>
          <meta name="keywords" content="stuff" />
        </Head>
      );

      await waitEffect();
      expect(document.title).toEqual('Existing Title');

      render(
        <Head>
          <title> </title>
          <meta name="keywords" content="stuff" />
        </Head>
      );
      await waitEffect();
      expect(document.title).toEqual('');
    });
  });

  describe('base tag', () => {
    test('set base tag', async () => {
      render(
        <Head>
          <base data-test-id="base" href="http://abc.com" />
        </Head>
      );

      await waitEffect();
      const $base = headElement.querySelector(`[data-test-id="base"]`);
      expect($base).not.toBeNull();
      expect($base?.getAttribute('href')).toEqual('http://abc.com');
    });

    test('set base tag based on deepest nested component', async () => {
      render(
        <div>
          <Head>
            <base data-test-id="base1" href="http://site1.com" />
          </Head>
          <Head>
            <base data-test-id="base2" href="http://site2.com" />
          </Head>
        </div>
      );
      await waitEffect();
      const $base1 = headElement.querySelector(`[data-test-id="base1"]`);
      const $base2 = headElement.querySelector(`[data-test-id="base2"]`);
      expect($base1).toBeNull();
      expect($base2).not.toBeNull();
      expect($base2?.getAttribute('href')).toEqual('http://site2.com');
    });
  });

  describe('meta tags', () => {
    test('set meta tags', async () => {
      render(
        <Head>
          <meta data-test-id="1" charSet="utf-8" />
          <meta
            data-test-id="2"
            name="description"
            content="Test description"
          />
          <meta data-test-id="3" httpEquiv="content-type" content="text/html" />
          <meta data-test-id="4" property="og:type" content="article" />
          <meta data-test-id="5" itemProp="name" content="Test name itemprop" />
        </Head>
      );

      await waitEffect();
      const $meta1 = headElement.querySelector(`[data-test-id="1"]`);
      expect($meta1).not.toBeNull();
      expect($meta1?.getAttribute('charset')).toEqual('utf-8');
      const $meta2 = headElement.querySelector(`[data-test-id="2"]`);
      expect($meta2).not.toBeNull();
      expect($meta2?.getAttribute('name')).toEqual('description');
      expect($meta2?.getAttribute('content')).toEqual('Test description');
      const $meta3 = headElement.querySelector(`[data-test-id="3"]`);
      expect($meta3).not.toBeNull();
      expect($meta3?.getAttribute('http-equiv')).toEqual('content-type');
      expect($meta3?.getAttribute('content')).toEqual('text/html');
      const $meta4 = headElement.querySelector(`[data-test-id="4"]`);
      expect($meta4).not.toBeNull();
      expect($meta4?.getAttribute('property')).toEqual('og:type');
      expect($meta4?.getAttribute('content')).toEqual('article');
      const $meta5 = headElement.querySelector(`[data-test-id="5"]`);
      expect($meta5).not.toBeNull();
      expect($meta5?.getAttribute('itemprop')).toEqual('name');
      expect($meta5?.getAttribute('content')).toEqual('Test name itemprop');
    });

    test('overrides duplicate meta tags with single meta tag in a nested component', async () => {
      render(
        <div>
          <Head>
            <meta name="description" content="Test description" />
            <meta name="description" content="Duplicate description" />
          </Head>
          <Head>
            <meta name="description" content="Inner description" />
          </Head>
        </div>
      );

      await waitEffect();
      const metaTags = document.querySelectorAll('meta[name="description"]');
      expect(metaTags.length).toEqual(1);
      expect(metaTags[0].outerHTML).toEqual(
        `<meta name="description" content="Inner description" ${SHUVI_HEAD_ATTRIBUTE}="true">`
      );
    });
  });

  describe('noram tags', () => {
    test('render link tags', async () => {
      render(
        <Head>
          <link data-test-id="1" href="http://localhost" rel="canonical" />
        </Head>
      );

      await waitEffect();
      const $tag = headElement.querySelector(`[data-test-id="1"]`);
      expect($tag).not.toBeNull();
      expect($tag?.outerHTML).toEqual(
        `<link data-test-id="1" href="http://localhost" rel="canonical" ${SHUVI_HEAD_ATTRIBUTE}="true">`
      );
    });

    test('render script tags', async () => {
      const innerHtml = `{foo:'bar'}`;
      render(
        <Head>
          <script
            data-test-id="1"
            src="http://localhost/test.js"
            type="text/javascript"
          />
          <script data-test-id="2" type="text/javascript">
            {innerHtml}
          </script>
        </Head>
      );

      await waitEffect();
      const $tag1 = headElement.querySelector(`[data-test-id="1"]`);
      expect($tag1).not.toBeNull();
      expect($tag1?.getAttribute('src')).toEqual('http://localhost/test.js');
      const $tag2 = headElement.querySelector(`[data-test-id="2"]`);
      expect($tag2).not.toBeNull();
      expect($tag2?.innerHTML).toEqual(innerHtml);
    });

    test('render style tags', async () => {
      const cssText1 = `body { background-color: green;}`;
      const cssText2 = `p { font-size: 12px; }`;
      render(
        <Head>
          <style data-test-id="1" type="text/css">
            {cssText1}
          </style>
          <style data-test-id="2">{cssText2}</style>
        </Head>
      );

      await waitEffect();
      const $tag1 = headElement.querySelector(`[data-test-id="1"]`);
      expect($tag1).not.toBeNull();
      expect($tag1?.getAttribute('type')).toEqual('text/css');
      expect($tag1?.innerHTML).toEqual(cssText1);
      const $tag2 = headElement.querySelector(`[data-test-id="2"]`);
      expect($tag2).not.toBeNull();
      expect($tag2?.innerHTML).toEqual(cssText2);
    });

    test('clears all tags if none are specified', async () => {
      const { rerender } = render(
        <Head>
          <link data-test href="http://localhost" rel="canonical" />
          <script
            data-test
            src="http://localhost/test.js"
            type="text/javascript"
          />
        </Head>
      );

      await waitEffect();
      const $tags = headElement.querySelectorAll(`[data-test]`);
      expect($tags.length).toBe(2);

      rerender(<Head />);
      await waitEffect();
      const $nextTags = headElement.querySelectorAll(`[data-test]`);
      expect($nextTags.length).toBe(0);
    });
  });

  describe('server', () => {
    test('should work', () => {
      serverRender(
        <Head>
          <title>Test Title</title>
        </Head>
      );

      const head = Head.rewind() || [];
      expect(head.length).toBe(1);
      expect(head[0].tagName).toBe('title');
      expect(head[0].attrs).toMatchObject({
        textContent: 'Test Title'
      });
    });
  });
});
