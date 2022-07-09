import * as React from 'react';
import { HeadState } from './types';
export declare const SHUVI_HEAD_ATTRIBUTE = 'data-shuvi-head';
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
declare function Head({
  children
}: {
  children?: React.ReactNode;
}): JSX.Element;
declare namespace Head {
  var rewind: () => HeadState | undefined;
}
export default Head;
