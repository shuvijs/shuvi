## Currently Situation

```js 
// routes/A/page
export { default, loader } from './component'
```

```js 
// routes/A/component 
import { useLoaderData } from '@shuvi/runtime';

export default function Component() {
  const data = useLoaderData();
  return (
    <div id="content">
      {data.loader}
    </div>
  );
}

export function loader(ctx) {
  return {
    loader: '111'
  };
}
```

```js 
// routes/A/page
export { default, loader } from './component'
```

Issue: The packaged file `loader.js` is unable to tree shake the `default` export of `./component`.

Reproduction:

1. Setting `config.optimization.usedExports(true);` can be marked for tree shaking as follows:
   
```js
/* unused harmony export default */
```   

2. `pnpm shuvi dev test/fixtures/loader-tree-shaking` run dev in local

Due to not accessing any pages, only `loader.js` will be packaged. In the packaged output `loader.js`, the `default` of `./component` is marked as an "unused harmony export".

3. visit / 

Due to on-demand packaging, routes/page will be packaged along with the dependency `default` exported from `./component`. Webpack considers that `default` in `./component` is being used and thus removes the `unused harmony export`, resulting in a large package size for loader.js.


### Solution 1: Virtual Module

./component =》 virtual/component 

```js 
// ./A/page
export { default } from './component'
```
```js 
// ./A/loader
export { loader } from 'virtual/component'
```

```js 
// virtual/component content
export function loader(ctx) {
  return {
    loader: '111'
  };
}
```
page-loader.js import ./A/loader


#### Disadvantage

1. Extraction of content from virtual modules
2. Difficult to synchronize with the mainstream process of webpack
3. Possible issues with extracting common chunks in client-side webpack


### Solution 2: Recursively find the user's real loader content.

```js
// page
export { default, loader } from './xx/page'
```
```js
// page-loaders.js A visit path will be generated.
import { loader as loader_0 } from 'src/routes/xx/page?shuvi-page-loader'
```

old: src/routes/xx/page?shuvi-page-loader

// page 

```js
export { loader } from './xx'
```

new: src/routes/xx/page?shuvi-page-loader

```js
// page 
export { loader } from './xx?shuvi-page-loader' // As it is a re-export, add query?shuvi-page-loader
```

If there is a need to re-export
```js
// page 
export { loader } from './anyModule?shuvi-page-loader'
```
```js
// anyModule re-export
export { loader } from './routes/A/component'
```
The module re-exported in the middle uses swc to add query?shuvi-page-loader
```js
// anyModule re-export
export { loader } from './routes/A/component?shuvi-page-loader'
```
Extract the user-defined `loader` content from the module `./routes/A/component?shuvi-page-loader` through the ability of SWC at last.

```js
// ./routes/A/component?shuvi-page-loader
export function loader(ctx) {
  return {
    loader: '111'
  };
}
```


### Discussion on the issue of re-exporting loader, categorized

The following cases only focus on the part of handling loaders in swc.

#### Case 1

Source code:
export { default, loader } from './xx/page'

Expected result code for `loader`:
export { loader } from './xx/page?shuvi-page-loader’

Perform tree shaking on the loader of ./xx/page through SWC

#### Case 2

Source code:
export { default as loader } from './xx'

Expected result code for `loader`:
export { default as loader } from './xx' 


#### Case 3

Source code:
Import { a } from './xx'
export const loader = a

Expected result code for `loader`:
Import { a } from './xx'
export const loader = a

### Disadvantage

Unable to handle case 2 and 3, causing recursion interruption.

### Solution 3: Actively mark the unused harmony export of loader.js chunk

### Disadvantage 

The implementation is relatively complex, and it is necessary to find the final module and compare other modules as unused.

Consider the module dependency relationship:

routes/A/page <= reexport(loader) + export A <= reexport(loader) + export B
<= routes/A/component

The intermediate modules `export A` and `export B` also need to be marked as unused.