// Based on https://github.com/zeit/next.js
// License: https://github.com/zeit/next.js/blob/977bf8d9ebd2845241b8689317f36e4e487f39d0/license.md

import React from 'react';
import { IHtmlTag } from '@shuvi/platform-shared/esm/runtime';
import withSideEffect from './side-effect';
import { HeadManagerContext } from './head-manager-context';
import { HeadElement, HeadState } from './types';

export const SHUVI_HEAD_ATTRIBUTE = 'data-shuvi-head';

const DOMAttributeNames: Record<string, string> = {
  acceptCharset: 'accept-charset',
  className: 'class',
  htmlFor: 'for',
  httpEquiv: 'http-equiv'
};

function reactElementToTag({ type, props }: HeadElement): IHtmlTag {
  const tag: IHtmlTag = {
    tagName: type,
    attrs: {}
  };
  for (const p in props) {
    if (!props.hasOwnProperty(p)) continue;
    if (p === 'children' || p === 'dangerouslySetInnerHTML') continue;

    // we don't render undefined props to the DOM
    if (props[p] === undefined) continue;

    const attr = DOMAttributeNames[p] || p.toLowerCase();
    tag.attrs[attr] = props[p];
  }

  const { children, dangerouslySetInnerHTML } = props;
  if (dangerouslySetInnerHTML) {
    tag.innerHTML = dangerouslySetInnerHTML.__html || '';
  } else if (children) {
    tag.attrs.textContent =
      typeof children === 'string' ? children : children.join('');
  }

  return tag;
}

function onlyReactElement(
  list: Array<React.ReactElement<any>>,
  child: React.ReactChild
): Array<React.ReactElement<any>> {
  // React children can be "string" or "number" in this case we ignore them for backwards compat
  if (typeof child === 'string' || typeof child === 'number') {
    return list;
  }
  // Adds support for React.Fragment
  if (child.type === React.Fragment) {
    return list.concat(
      (
        React.Children.toArray(child.props.children) as React.ReactChild[]
      ).reduce(
        (
          fragmentList: Array<React.ReactElement<any>>,
          fragmentChild: React.ReactChild
        ): Array<React.ReactElement<any>> => {
          if (
            typeof fragmentChild === 'string' ||
            typeof fragmentChild === 'number'
          ) {
            return fragmentList;
          }
          return fragmentList.concat(fragmentChild);
        },
        []
      )
    );
  }
  return list.concat(child);
}

const METATYPES = ['name', 'httpEquiv', 'charSet', 'itemProp'];

/*
 returns a function for filtering head child elements
 which shouldn't be duplicated, like <title/>
 Also adds support for deduplicated `key` properties
*/
function unique() {
  const keys = new Set();
  const tags = new Set();
  const metaTypes = new Set();
  const metaCategories: { [metatype: string]: Set<string> } = {};

  return (h: React.ReactElement<any>) => {
    let unique = true;

    if (h.key && typeof h.key !== 'number' && h.key.indexOf('$') > 0) {
      const key = h.key.slice(h.key.indexOf('$') + 1);
      if (keys.has(key)) {
        unique = false;
      } else {
        keys.add(key);
      }
    }

    // eslint-disable-next-line default-case
    switch (h.type) {
      case 'title':
      case 'base':
        if (tags.has(h.type)) {
          unique = false;
        } else {
          tags.add(h.type);
        }
        break;
      case 'meta':
        for (let i = 0, len = METATYPES.length; i < len; i++) {
          const metatype = METATYPES[i];
          if (!h.props.hasOwnProperty(metatype)) continue;

          if (metatype === 'charSet') {
            if (metaTypes.has(metatype)) {
              unique = false;
            } else {
              metaTypes.add(metatype);
            }
          } else {
            const category = h.props[metatype];
            const categories = metaCategories[metatype] || new Set();
            if (categories.has(category)) {
              unique = false;
            } else {
              categories.add(category);
              metaCategories[metatype] = categories;
            }
          }
        }
        break;
    }

    return unique;
  };
}

function onlyHeadElement(element: React.ReactElement<any>): boolean {
  return typeof element.type === 'string';
}

/**
 *
 * @param headElement List of multiple <Head> instances
 */
function reduceComponents(
  headElements: Array<React.ReactElement<any>>
): HeadState {
  return headElements
    .reduce(
      (list: React.ReactChild[], headElement: React.ReactElement<any>) => {
        const headElementChildren = React.Children.toArray(
          headElement.props.children
        ) as React.ReactChild[];
        return list.concat(headElementChildren);
      },
      []
    )
    .reduce(onlyReactElement, [])
    .filter(onlyHeadElement)
    .reverse()
    .filter(unique())
    .reverse()
    .map(e => {
      const { type, props } = e as any as HeadElement;
      const headElement = {
        type,
        props: {
          ...props,
          [SHUVI_HEAD_ATTRIBUTE]: 'true'
        }
      };
      return reactElementToTag(headElement);
    });
}

const Effect = withSideEffect();

/**
 * This component injects elements to `<head>` of your page.
 * To avoid duplicated `tags` in `<head>` you can use the `key` property, which will make sure every tag is only rendered once.
 *
 * ```ts
 * import { Head } from "@shuvi/runtime";
 *
 * function IndexPage() {
 *   return (
 *     <div>
 *       <Head>
 *         <title>My page title</title>
 *         <meta name="viewport" content="initial-scale=1.0, width=device-width" />
 *       </Head>
 *       <p>Hello world!</p>
 *    </div>
 *  );
 * }
 *
 * export default IndexPage;
 * ```
 *
 */
function Head({ children }: { children?: React.ReactNode }) {
  return (
    <HeadManagerContext.Consumer>
      {updateHead => (
        // @ts-ignore
        <Effect
          reduceComponentsToState={reduceComponents}
          handleStateChange={updateHead}
        >
          {children}
        </Effect>
      )}
    </HeadManagerContext.Consumer>
  );
}

Head.rewind = Effect.rewind;

export default Head;
