# Emotion Plugin

## Overview

The Emotion plugin is a SWC transform that provides CSS-in-JS functionality for the Emotion library. It enables writing styles using JavaScript/TypeScript with features like dynamic styling, theme support, and CSS prop optimization. The plugin transforms Emotion's styled components and CSS prop usage into optimized CSS output.

## Getting Started

```bash
# Install the compiler package
pnpm add @shuvi/compiler
```

## Usage

### Direct Transform Usage

```ts
import { transform } from '@shuvi/compiler';

const result = await transform(code, {
  emotion: {
    sourceMap: true,
    autoLabel: 'dev-only',
    labelFormat: '[local]',
    importSource: '@emotion/react'
  }
});
```

### Loader Usage

Use the `@shuvi/swc-loader` to transform Emotion code in your build pipeline.

```ts
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.(js|ts|tsx)$/,
        use: {
          loader: '@shuvi/swc-loader',
          options: {
            jsc: {
              transform: {
                react: {
                  emotion: {
                    sourceMap: true,
                    autoLabel: 'dev-only',
                    labelFormat: '[local]',
                    importSource: '@emotion/react'
                  }
                }
              }
            }
          }
        }
      }
    ]
  }
};
```

## API

### Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `sourceMap` | `boolean` | `false` | Enable source maps for debugging |
| `autoLabel` | `'dev-only' \| 'never' \| 'always'` | `'dev-only'` | Automatically add labels to CSS classes |
| `labelFormat` | `string` | `'[local]'` | Format for auto-generated labels |
| `importSource` | `string` | `'@emotion/react'` | The import source for Emotion |
| `jsxImportSource` | `string` | `'@emotion/react'` | The JSX import source |
| `cssPropOptimization` | `boolean` | `true` | Optimize CSS prop usage |
| `styled` | `object` | `{}` | Styled components configuration |

### Styled Components Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `pure` | `boolean` | `false` | Add pure annotations to styled components |

## Behavior Specification

### 1. CSS Prop Transformation

The plugin transforms JSX elements with CSS props into optimized Emotion components.

#### Supported CSS Prop Usage

- **Object Syntax**: `css={{ color: 'red' }}`
- **Template Literals**: `css={css`color: red;`}`
- **Function Syntax**: `css={(theme) => ({ color: theme.colors.primary })}`
- **Array Syntax**: `css={[baseStyles, conditionalStyles]}`

#### Transformation Rules

- **CSS Objects**: Converted to optimized CSS-in-JS
- **Template Literals**: Preserved and optimized
- **Dynamic Values**: Handled with proper runtime evaluation
- **Theme Access**: Supports theme context and prop access

### 2. Styled Components

Styled components are transformed to use Emotion's optimized runtime.

#### Supported Patterns

- **Basic Styled Components**: `styled.div\`color: red;\``
- **Extended Components**: `styled(Component)\`color: red;\``
- **Dynamic Props**: `styled.div<{color: string}>\`color: \${props => props.color};\``
- **Composition**: `styled(StyledComponent)\`background: blue;\``

### 3. CSS Import Optimization

The plugin optimizes CSS imports and ensures proper bundling.

#### Optimization Features

- **Tree Shaking**: Remove unused CSS
- **Code Splitting**: Optimize CSS chunks
- **Critical CSS**: Extract critical styles
- **Minification**: Compress CSS output

## Test Cases

Please refer to the [test cases](../../../src/swc/__tests__/plugins/emotion.test.ts) for detailed examples.

### 1. Styled Components with Template Literals

**Description**: Tests styled components with template literals and dynamic values.

#### Input

```tsx
import { css } from '@emotion/react'
import styled from '@emotion/styled'

const unitNormal = '1rem'
const unitLarge = '2rem'

const Example = styled.div`
  margin: ${unitNormal} ${unitLarge};
`
export const Animated = styled.div`
  & code {
    background-color: linen;
  }
  animation: ${({ animation }) => animation} 0.2s infinite ease-in-out alternate;
`

const shadowBorder = ({ width = '1px', color }) =>
  css`
    box-shadow: inset 0px 0px 0px ${width} ${color};
  `

const StyledInput = styled.input`
  ${shadowBorder({ color: 'red', width: '4px' })}
`
```

#### Transform Code

```ts
import { transform } from '@shuvi/compiler';

const result = await transform(code, {
  emotion: {
    enabled: true,
    sourcemap: true,
    autoLabel: true
  }
});
```

#### Output

```tsx
import { css } from '@emotion/react';
import styled from '@emotion/styled';
const unitNormal = '1rem';
const unitLarge = '2rem';
const Example = /*#__PURE__*/ styled("div", {
    target: "e6j9wbm0",
    label: "Example"
})("margin:", unitNormal, " ", unitLarge, ";", "/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9vcC5qcyIsInNvdXJjZXMiOlsibm9vcC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJcbiAgICBpbXBvcnQgeyBjc3MgfSBmcm9tICdAZW1vdGlvbi9yZWFjdCdcbiAgICBpbXBvcnQgc3R5bGVkIGZyb20gJ0BlbW90aW9uL3N0eWxlZCdcblxuICAgIGNvbnN0IHVuaXROb3JtYWwgPSAnMXJlbSdcbiAgICBjb25zdCB1bml0TGFyZ2UgPSAnMnJlbSdcblxuICAgIGNvbnN0IEV4YW1wbGUgPSBzdHlsZWQuZGl2YFxuICAgICAgbWFyZ2luOiAke3VuaXROb3JtYWx9ICR7dW5pdExhcmdlfTtcbiAgICBgXG4gICAgZXhwb3J0IGNvbnN0IEFuaW1hdGVkID0gc3R5bGVkLmRpdmBcbiAgICAgICYgY29kZSB7XG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6IGxpbmVuO1xuICAgICAgfVxuICAgICAgYW5pbWF0aW9uOiAkeyh7IGFuaW1hdGlvbiB9KSA9PiBhbmltYXRpb259IDAuMnMgaW5maW5pdGUgZWFzZS1pbi1vdXQgYWx0ZXJuYXRlO1xuICAgIGBcblxuICAgIGNvbnN0IHNoYWRvd0JvcmRlciA9ICh7IHdpZHRoID0gJzFweCcsIGNvbG9yIH0pID0+XG4gICAgICBjc3NgXG4gICAgICAgIGJveC1zaGFkb3c6IGluc2V0IDBweCAwcHggMHB4ICR7d2lkdGh9ICR7Y29sb3J9O1xuICAgICAgYFxuXG4gICAgY29uc3QgU3R5bGVkSW5wdXQgPSBzdHlsZWQuaW5wdXRgXG4gICAgICAke3NoYWRvd0JvcmRlcih7IGNvbG9yOiAncmVkJywgd2lkdGg6ICc0cHgnIH0pfVxuICAgIGBcbiAgICAiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBT29CIn0= */");
export const Animated = /*#__PURE__*/ styled("div", {
    target: "e6j9wbm1",
    label: "Animated"
})("& code{background-color:linen;}animation:", ({ animation  })=>animation, " 0.2s infinite ease-in-out alternate;", "/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9vcC5qcyIsInNvdXJjZXMiOlsibm9vcC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJcbiAgICBpbXBvcnQgeyBjc3MgfSBmcm9tICdAZW1vdGlvbi9yZWFjdCdcbiAgICBpbXBvcnQgc3R5bGVkIGZyb20gJ0BlbW90aW9uL3N0eWxlZCdcblxuICAgIGNvbnN0IHVuaXROb3JtYWwgPSAnMXJlbSdcbiAgICBjb25zdCB1bml0TGFyZ2UgPSAnMnJlbSdcblxuICAgIGNvbnN0IEV4YW1wbGUgPSBzdHlsZWQuZGl2YFxuICAgICAgbWFyZ2luOiAke3VuaXROb3JtYWx9ICR7dW5pdExhcmdlfTtcbiAgICBgXG4gICAgZXhwb3J0IGNvbnN0IEFuaW1hdGVkID0gc3R5bGVkLmRpdmBcbiAgICAgICYgY29kZSB7XG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6IGxpbmVuO1xuICAgICAgfVxuICAgICAgYW5pbWF0aW9uOiAkeyh7IGFuaW1hdGlvbiB9KSA9PiBhbmltYXRpb259IDAuMnMgaW5maW5pdGUgZWFzZS1pbi1vdXQgYWx0ZXJuYXRlO1xuICAgIGBcblxuICAgIGNvbnN0IHNoYWRvd0JvcmRlciA9ICh7IHdpZHRoID0gJzFweCcsIGNvbG9yIH0pID0+XG4gICAgICBjc3NgXG4gICAgICAgIGJveC1zaGFkb3c6IGluc2V0IDBweCAwcHggMHB4ICR7d2lkdGh9ICR7Y29sb3J9O1xuICAgICAgYFxuXG4gICAgY29uc3QgU3R5bGVkSW5wdXQgPSBzdHlsZWQuaW5wdXRgXG4gICAgICAke3NoYWRvd0JvcmRlcih7IGNvbG9yOiAncmVkJywgd2lkdGg6ICc0cHgnIH0pfVxuICAgIGBcbiAgICAiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBVTRCIn0= */");
const shadowBorder = ({ width ='1px' , color  })=>/*#__PURE__*/ css("box-shadow:inset 0px 0px 0px ", width, " ", color, ";", "shadowBorder", "/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9vcC5qcyIsInNvdXJjZXMiOlsibm9vcC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJcbiAgICBpbXBvcnQgeyBjc3MgfSBmcm9tICdAZW1vdGlvbi9yZWFjdCdcbiAgICBpbXBvcnQgc3R5bGVkIGZyb20gJ0BlbW90aW9uL3N0eWxlZCdcblxuICAgIGNvbnN0IHVuaXROb3JtYWwgPSAnMXJlbSdcbiAgICBjb25zdCB1bml0TGFyZ2UgPSAnMnJlbSdcblxuICAgIGNvbnN0IEV4YW1wbGUgPSBzdHlsZWQuZGl2YFxuICAgICAgbWFyZ2luOiAke3VuaXROb3JtYWx9ICR7dW5pdExhcmdlfTtcbiAgICBgXG4gICAgZXhwb3J0IGNvbnN0IEFuaW1hdGVkID0gc3R5bGVkLmRpdmBcbiAgICAgICYgY29kZSB7XG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6IGxpbmVuO1xuICAgICAgfVxuICAgICAgYW5pbWF0aW9uOiAkeyh7IGFuaW1hdGlvbiB9KSA9PiBhbmltYXRpb259IDAuMnMgaW5maW5pdGUgZWFzZS1pbi1vdXQgYWx0ZXJuYXRlO1xuICAgIGBcblxuICAgIGNvbnN0IHNoYWRvd0JvcmRlciA9ICh7IHdpZHRoID0gJzFweCcsIGNvbG9yIH0pID0+XG4gICAgICBjc3NgXG4gICAgICAgIGJveC1zaGFkb3c6IGluc2V0IDBweCAwcHggMHB4ICR7d2lkdGh9ICR7Y29sb3J9O1xuICAgICAgYFxuXG4gICAgY29uc3QgU3R5bGVkSW5wdXQgPSBzdHlsZWQuaW5wdXRgXG4gICAgICAke3NoYWRvd0JvcmRlcih7IGNvbG9yOiAncmVkJywgd2lkdGg6ICc0cHgnIH0pfVxuICAgIGBcbiAgICAiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBa0JNIn0= */");
const StyledInput = /*#__PURE__*/ styled("input", {
    target: "e6j9wbm2",
    label: "StyledInput"
})(shadowBorder({
    color: 'red',
    width: '4px'
}), "/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9vcC5qcyIsInNvdXJjZXMiOlsibm9vcC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJcbiAgICBpbXBvcnQgeyBjc3MgfSBmcm9tICdAZW1vdGlvbi9yZWFjdCdcbiAgICBpbXBvcnQgc3R5bGVkIGZyb20gJ0BlbW90aW9uL3N0eWxlZCdcblxuICAgIGNvbnN0IHVuaXROb3JtYWwgPSAnMXJlbSdcbiAgICBjb25zdCB1bml0TGFyZ2UgPSAnMnJlbSdcblxuICAgIGNvbnN0IEV4YW1wbGUgPSBzdHlsZWQuZGl2YFxuICAgICAgbWFyZ2luOiAke3VuaXROb3JtYWx9ICR7dW5pdExhcmdlfTtcbiAgICBgXG4gICAgZXhwb3J0IGNvbnN0IEFuaW1hdGVkID0gc3R5bGVkLmRpdmBcbiAgICAgICYgY29kZSB7XG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6IGxpbmVuO1xuICAgICAgfVxuICAgICAgYW5pbWF0aW9uOiAkeyh7IGFuaW1hdGlvbiB9KSA9PiBhbmltYXRpb259IDAuMnMgaW5maW5pdGUgZWFzZS1pbi1vdXQgYWx0ZXJuYXRlO1xuICAgIGBcblxuICAgIGNvbnN0IHNoYWRvd0JvcmRlciA9ICh7IHdpZHRoID0gJzFweCcsIGNvbG9yIH0pID0+XG4gICAgICBjc3NgXG4gICAgICAgIGJveC1zaGFkb3c6IGluc2V0IDBweCAwcHggMHB4ICR7d2lkdGh9ICR7Y29sb3J9O1xuICAgICAgYFxuXG4gICAgY29uc3QgU3R5bGVkSW5wdXQgPSBzdHlsZWQuaW5wdXRgXG4gICAgICAke3NoYWRvd0JvcmRlcih7IGNvbG9yOiAncmVkJywgd2lkdGg6ICc0cHgnIH0pfVxuICAgIGBcbiAgICAiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBc0J3QiJ9 */");
```

### 2. CSS Function with Object and Template Literals

**Description**: Tests css function with both object syntax and template literal syntax.

#### Input

```tsx
import { css, Global } from '@emotion/react'
import styled from '@emotion/styled'

const stylesInCallback = (props) =>
  css({
    color: 'red',
    background: 'yellow',
    width: `${props.scale * 100}px`,
  })

const styles = css({
  color: 'red',
  width: '20px',
})

const styles2 = css`
  color: red;
  width: 20px;
`
```

#### Transform Code

```ts
import { transform } from '@shuvi/compiler';

const result = await transform(code, {
  emotion: {
    enabled: true,
    sourcemap: true,
    autoLabel: true
  }
});
```

#### Output

```tsx
import { css, Global } from '@emotion/react';
import styled from '@emotion/styled';
const stylesInCallback = (props)=>/*#__PURE__*/ css({
        color: 'red',
        background: 'yellow',
        width: `${props.scale * 100}px`
    }, "label:stylesInCallback", "/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9vcC5qcyIsInNvdXJjZXMiOlsibm9vcC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJcbiAgICBpbXBvcnQgeyBjc3MsIEdsb2JhbCB9IGZyb20gJ0BlbW90aW9uL3JlYWN0J1xuICAgIGltcG9ydCBzdHlsZWQgZnJvbSAnQGVtb3Rpb24vc3R5bGVkJ1xuXG4gICAgY29uc3Qgc3R5bGVzSW5DYWxsYmFjayA9IChwcm9wcykgPT5cbiAgICAgIGNzc3tcbiAgICAgICAgY29sb3I6ICdyZWQnLFxuICAgICAgICBiYWNrZ3JvdW5kOiAneWVsbG93JyxcbiAgICAgICAgd2lkdGg6IGAke3Byb3BzLnNjYWxlICogMTAwfXB4YCxcbiAgICAgIH1cblxuICAgIGNvbnN0IHN0eWxlcyA9IGNzc3tcbiAgICAgIGNvbG9yOiAncmVkJyxcbiAgICAgIHdpZHRoOiAnMjBweCcsXG4gICAgfVxuXG4gICAgY29uc3Qgc3R5bGVzMiA9IGNzc2BcbiAgICAgIGNvbG9yOiByZWQ7XG4gICAgICB3aWR0aDogMjBweDtcbiAgICBgXG4gICAgIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9vQiJ9 */");
const styles = /*#__PURE__*/ css({
    color: 'red',
    width: '20px'
}, "label:styles", "/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9vcC5qcyIsInNvdXJjZXMiOlsibm9vcC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJcbiAgICBpbXBvcnQgeyBjc3MsIEdsb2JhbCB9IGZyb20gJ0BlbW90aW9uL3JlYWN0J1xuICAgIGltcG9ydCBzdHlsZWQgZnJvbSAnQGVtb3Rpb24vc3R5bGVkJ1xuXG4gICAgY29uc3Qgc3R5bGVzSW5DYWxsYmFjayA9IChwcm9wcykgPT5cbiAgICAgIGNzc3tcbiAgICAgICAgY29sb3I6ICdyZWQnLFxuICAgICAgICBiYWNrZ3JvdW5kOiAneWVsbG93JyxcbiAgICAgICAgd2lkdGg6IGAke3Byb3BzLnNjYWxlICogMTAwfXB4YCxcbiAgICAgIH1cblxuICAgIGNvbnN0IHN0eWxlcyA9IGNzc3tcbiAgICAgIGNvbG9yOiAncmVkJyxcbiAgICAgIHdpZHRoOiAnMjBweCcsXG4gICAgfVxuXG4gICAgY29uc3Qgc3R5bGVzMiA9IGNzc2BcbiAgICAgIGNvbG9yOiByZWQ7XG4gICAgICB3aWR0aDogMjBweDtcbiAgICBgXG4gICAgIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQVU0QiJ9 */");
const styles2 = /*#__PURE__*/ css("color:red;width:20px;", "label:styles2", "/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9vcC5qcyIsInNvdXJjZXMiOlsibm9vcC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJcbiAgICBpbXBvcnQgeyBjc3MsIEdsb2JhbCB9IGZyb20gJ0BlbW90aW9uL3JlYWN0J1xuICAgIGltcG9ydCBzdHlsZWQgZnJvbSAnQGVtb3Rpb24vc3R5bGVkJ1xuXG4gICAgY29uc3Qgc3R5bGVzSW5DYWxsYmFjayA9IChwcm9wcykgPT5cbiAgICAgIGNzc3tcbiAgICAgICAgY29sb3I6ICdyZWQnLFxuICAgICAgICBiYWNrZ3JvdW5kOiAneWVsbG93JyxcbiAgICAgICAgd2lkdGg6IGAke3Byb3BzLnNjYWxlICogMTAwfXB4YCxcbiAgICAgIH1cblxuICAgIGNvbnN0IHN0eWxlcyA9IGNzc3tcbiAgICAgIGNvbG9yOiAncmVkJyxcbiAgICAgIHdpZHRoOiAnMjBweCcsXG4gICAgfVxuXG4gICAgY29uc3Qgc3R5bGVzMiA9IGNzc2BcbiAgICAgIGNvbG9yOiByZWQ7XG4gICAgICB3aWR0aDogMjBweDtcbiAgICBgXG4gICAgIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQWtCTSI= */");
```

### 3. Styled Components with Different Syntax

**Description**: Tests styled components with object syntax, template literals, and function calls.

#### Input

```tsx
import styled from '@emotion/styled'

const DivContainer = styled.div({
  background: 'red',
})

const DivContainer2 = styled.div`
  background: red;
`

const SpanContainer = styled('span')({
  background: 'yellow',
})

export const DivContainerExtended = styled(DivContainer)``
export const DivContainerExtended2 = styled(DivContainer)({})

const Container = styled('button')`
  background: red;
  ${stylesInCallback}
  ${() =>
    css({
      background: 'red',
    })}
  color: yellow;
  font-size: 12px;
`
```

#### Transform Code

```ts
import { transform } from '@shuvi/compiler';

const result = await transform(code, {
  emotion: {
    enabled: true,
    sourcemap: true,
    autoLabel: true
  }
});
```

#### Output

```tsx
import styled from '@emotion/styled';
const DivContainer = /*#__PURE__*/ styled("div", {
    target: "e6j9wbm3",
    label: "DivContainer"
})({
    background: 'red'
}, "/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9vcC5qcyIsInNvdXJjZXMiOlsibm9vcC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJcbiAgICBpbXBvcnQgc3R5bGVkIGZyb20gJ0BlbW90aW9uL3N0eWxlZCdcblxuICAgIGNvbnN0IERpdkNvbnRhaW5lciA9IHN0eWxlZC5kaXYoe1xuICAgICAgYmFja2dyb3VuZDogJ3JlZCcsXG4gICAgfSlcblxuICAgIGNvbnN0IERpdkNvbnRhaW5lcjIgPSBzdHlsZWQuZGl2YFxuICAgICAgYmFja2dyb3VuZDogcmVkO1xuICAgIGBcblxuICAgIGNvbnN0IFNwYW5Db250YWluZXIgPSBzdHlsZWQoJ3NwYW4nKSh7XG4gICAgICBiYWNrZ3JvdW5kOiAneWVsbG93JyxcbiAgICB9KVxuXG4gICAgZXhwb3J0IGNvbnN0IERpdkNvbnRhaW5lckV4dGVuZGVkID0gc3R5bGVkKERpdkNvbnRhaW5lcillYFxuICAgIGV4cG9ydCBjb25zdCBEaXZDb250YWluZXJFeHRlbmRlZDIgPSBzdHlsZWQoRGl2Q29udGFpbmVyKSgpe1xuXG4gICAgY29uc3QgQ29udGFpbmVyID0gc3R5bGVkKCdidXR0b24nKWJcbiAgICAgIGJhY2tncm91bmQ6IHJlZDtcbiAgICAgICR7c3R5bGVzSW5DYWxsYmFja30KICAgICAgJHsoKSA9PlxuICAgICAgICBjc3MoXG4gICAgICAgICAgYmFja2dyb3VuZDogJ3JlZCcsXG4gICAgICAgIClcbiAgICAgICl9XG4gICAgICBjb2xvcjogeWVsbG93O1xuICAgICAgZm9udC1zaXplOiAxMnB4O1xuICAgIGBcbiAgICAiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBT29CIn0= */");
const DivContainer2 = /*#__PURE__*/ styled("div", {
    target: "e6j9wbm4",
    label: "DivContainer2"
})("background:red;", "/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9vcC5qcyIsInNvdXJjZXMiOlsibm9vcC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJcbiAgICBpbXBvcnQgc3R5bGVkIGZyb20gJ0BlbW90aW9uL3N0eWxlZCdcblxuICAgIGNvbnN0IERpdkNvbnRhaW5lciA9IHN0eWxlZC5kaXYoe1xuICAgICAgYmFja2dyb3VuZDogJ3JlZCcsXG4gICAgfSlcblxuICAgIGNvbnN0IERpdkNvbnRhaW5lcjIgPSBzdHlsZWQuZGl2YFxuICAgICAgYmFja2dyb3VuZDogcmVkO1xuICAgIGBcblxuICAgIGNvbnN0IFNwYW5Db250YWluZXIgPSBzdHlsZWQoJ3NwYW4nKSh7XG4gICAgICBiYWNrZ3JvdW5kOiAneWVsbG93JyxcbiAgICB9KVxuXG4gICAgZXhwb3J0IGNvbnN0IERpdkNvbnRhaW5lckV4dGVuZGVkID0gc3R5bGVkKERpdkNvbnRhaW5lcillYFxuICAgIGV4cG9ydCBjb25zdCBEaXZDb250YWluZXJFeHRlbmRlZDIgPSBzdHlsZWQoRGl2Q29udGFpbmVyKSgpe1xuXG4gICAgY29uc3QgQ29udGFpbmVyID0gc3R5bGVkKCdidXR0b24nKWJcbiAgICAgIGJhY2tncm91bmQ6IHJlZDtcbiAgICAgICR7c3R5bGVzSW5DYWxsYmFja30KICAgICAgJHsoKSA9PlxuICAgICAgICBjc3MoXG4gICAgICAgICAgYmFja2dyb3VuZDogJ3JlZCcsXG4gICAgICAgIClcbiAgICAgICl9XG4gICAgICBjb2xvcjogeWVsbG93O1xuICAgICAgZm9udC1zaXplOiAxMnB4O1xuICAgIGBcbiAgICAiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBVTRCIn0= */");
const SpanContainer = /*#__PURE__*/ styled("span", {
    target: "e6j9wbm5",
    label: "SpanContainer"
})({
    background: 'yellow'
}, "/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9vcC5qcyIsInNvdXJjZXMiOlsibm9vcC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJcbiAgICBpbXBvcnQgc3R5bGVkIGZyb20gJ0BlbW90aW9uL3N0eWxlZCdcblxuICAgIGNvbnN0IERpdkNvbnRhaW5lciA9IHN0eWxlZC5kaXYoe1xuICAgICAgYmFja2dyb3VuZDogJ3JlZCcsXG4gICAgfSlcblxuICAgIGNvbnN0IERpdkNvbnRhaW5lcjIgPSBzdHlsZWQuZGl2YFxuICAgICAgYmFja2dyb3VuZDogcmVkO1xuICAgIGBcblxuICAgIGNvbnN0IFNwYW5Db250YWluZXIgPSBzdHlsZWQoJ3NwYW4nKSh7XG4gICAgICBiYWNrZ3JvdW5kOiAneWVsbG93JyxcbiAgICB9KVxuXG4gICAgZXhwb3J0IGNvbnN0IERpdkNvbnRhaW5lckV4dGVuZGVkID0gc3R5bGVkKERpdkNvbnRhaW5lcillYFxuICAgIGV4cG9ydCBjb25zdCBEaXZDb250YWluZXJFeHRlbmRlZDIgPSBzdHlsZWQoRGl2Q29udGFpbmVyKSgpe1xuXG4gICAgY29uc3QgQ29udGFpbmVyID0gc3R5bGVkKCdidXR0b24nKWJcbiAgICAgIGJhY2tncm91bmQ6IHJlZDtcbiAgICAgICR7c3R5bGVzSW5DYWxsYmFja30KICAgICAgJHsoKSA9PlxuICAgICAgICBjc3MoXG4gICAgICAgICAgYmFja2dyb3VuZDogJ3JlZCcsXG4gICAgICAgIClcbiAgICAgICl9XG4gICAgICBjb2xvcjogeWVsbG93O1xuICAgICAgZm9udC1zaXplOiAxMnB4O1xuICAgIGBcbiAgICAiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBbUJ3QiJ9 */");
export const DivContainerExtended = /*#__PURE__*/ styled(DivContainer, {
    target: "e6j9wbm6",
    label: "DivContainerExtended"
})("", "/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9vcC5qcyIsInNvdXJjZXMiOlsibm9vcC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJcbiAgICBpbXBvcnQgc3R5bGVkIGZyb20gJ0BlbW90aW9uL3N0eWxlZCdcblxuICAgIGNvbnN0IERpdkNvbnRhaW5lciA9IHN0eWxlZC5kaXYoe1xuICAgICAgYmFja2dyb3VuZDogJ3JlZCcsXG4gICAgfSlcblxuICAgIGNvbnN0IERpdkNvbnRhaW5lcjIgPSBzdHlsZWQuZGl2YFxuICAgICAgYmFja2dyb3VuZDogcmVkO1xuICAgIGBcblxuICAgIGNvbnN0IFNwYW5Db250YWluZXIgPSBzdHlsZWQoJ3NwYW4nKSh7XG4gICAgICBiYWNrZ3JvdW5kOiAneWVsbG93JyxcbiAgICB9KVxuXG4gICAgZXhwb3J0IGNvbnN0IERpdkNvbnRhaW5lckV4dGVuZGVkID0gc3R5bGVkKERpdkNvbnRhaW5lcillYFxuICAgIGV4cG9ydCBjb25zdCBEaXZDb250YWluZXJFeHRlbmRlZDIgPSBzdHlsZWQoRGl2Q29udGFpbmVyKSgpe1xuXG4gICAgY29uc3QgQ29udGFpbmVyID0gc3R5bGVkKCdidXR0b24nKWJcbiAgICAgIGJhY2tncm91bmQ6IHJlZDtcbiAgICAgICR7c3R5bGVzSW5DYWxsYmFja30KICAgICAgJHsoKSA9PlxuICAgICAgICBjc3MoXG4gICAgICAgICAgYmFja2dyb3VuZDogJ3JlZCcsXG4gICAgICAgIClcbiAgICAgICl9XG4gICAgICBjb2xvcjogeWVsbG93O1xuICAgICAgZm9udC1zaXplOiAxMnB4O1xuICAgIGBcbiAgICAiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBd0J5QiJ9 */");
export const DivContainerExtended2 = /*#__PURE__*/ styled(DivContainer, {
    target: "e6j9wbm7",
    label: "DivContainerExtended2"
})({}, "/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9vcC5qcyIsInNvdXJjZXMiOlsibm9vcC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJcbiAgICBpbXBvcnQgc3R5bGVkIGZyb20gJ0BlbW90aW9uL3N0eWxlZCdcblxuICAgIGNvbnN0IERpdkNvbnRhaW5lciA9IHN0eWxlZC5kaXYoe1xuICAgICAgYmFja2dyb3VuZDogJ3JlZCcsXG4gICAgfSlcblxuICAgIGNvbnN0IERpdkNvbnRhaW5lcjIgPSBzdHlsZWQuZGl2YFxuICAgICAgYmFja2dyb3VuZDogcmVkO1xuICAgIGBcblxuICAgIGNvbnN0IFNwYW5Db250YWluZXIgPSBzdHlsZWQoJ3NwYW4nKSh7XG4gICAgICBiYWNrZ3JvdW5kOiAneWVsbG93JyxcbiAgICB9KVxuXG4gICAgZXhwb3J0IGNvbnN0IERpdkNvbnRhaW5lckV4dGVuZGVkID0gc3R5bGVkKERpdkNvbnRhaW5lcillYFxuICAgIGV4cG9ydCBjb25zdCBEaXZDb250YWluZXJFeHRlbmRlZDIgPSBzdHlsZWQoRGl2Q29udGFpbmVyKSgpe1xuXG4gICAgY29uc3QgQ29udGFpbmVyID0gc3R5bGVkKCdidXR0b24nKWJcbiAgICAgIGJhY2tncm91bmQ6IHJlZDtcbiAgICAgICR7c3R5bGVzSW5DYWxsYmFja30KICAgICAgJHsoKSA9PlxuICAgICAgICBjc3MoXG4gICAgICAgICAgYmFja2dyb3VuZDogJ3JlZCcsXG4gICAgICAgIClcbiAgICAgICl9XG4gICAgICBjb2xvcjogeWVsbG93O1xuICAgICAgZm9udC1zaXplOiAxMnB4O1xuICAgIGBcbiAgICAiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBd0J5QiJ9 */");
const Container = /*#__PURE__*/ styled("button", {
    target: "e6j9wbm8",
    label: "Container"
})("background:red;", stylesInCallback, (()=>/*#__PURE__*/ css({
    background: 'red'
})), "color:yellow;font-size:12px;", "/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9vcC5qcyIsInNvdXJjZXMiOlsibm9vcC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJcbiAgICBpbXBvcnQgc3R5bGVkIGZyb20gJ0BlbW90aW9uL3N0eWxlZCdcblxuICAgIGNvbnN0IERpdkNvbnRhaW5lciA9IHN0eWxlZC5kaXYoe1xuICAgICAgYmFja2dyb3VuZDogJ3JlZCcsXG4gICAgfSlcblxuICAgIGNvbnN0IERpdkNvbnRhaW5lcjIgPSBzdHlsZWQuZGl2YFxuICAgICAgYmFja2dyb3VuZDogcmVkO1xuICAgIGBcblxuICAgIGNvbnN0IFNwYW5Db250YWluZXIgPSBzdHlsZWQoJ3NwYW4nKSh7XG4gICAgICBiYWNrZ3JvdW5kOiAneWVsbG93JyxcbiAgICB9KVxuXG4gICAgZXhwb3J0IGNvbnN0IERpdkNvbnRhaW5lckV4dGVuZGVkID0gc3R5bGVkKERpdkNvbnRhaW5lcillYFxuICAgIGV4cG9ydCBjb25zdCBEaXZDb250YWluZXJFeHRlbmRlZDIgPSBzdHlsZWQoRGl2Q29udGFpbmVyKSgpe1xuXG4gICAgY29uc3QgQ29udGFpbmVyID0gc3R5bGVkKCdidXR0b24nKWJcbiAgICAgIGJhY2tncm91bmQ6IHJlZDtcbiAgICAgICR7c3R5bGVzSW5DYWxsYmFja30KICAgICAgJHsoKSA9PlxuICAgICAgICBjc3MoXG4gICAgICAgICAgYmFja2dyb3VuZDogJ3JlZCcsXG4gICAgICAgIClcbiAgICAgICl9XG4gICAgICBjb2xvcjogeWVsbG93O1xuICAgICAgZm9udC1zaXplOiAxMnB4O1xuICAgIGBcbiAgICAiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBd0J5QiJ9 */");
```

### 4. CSS Prop in JSX

**Description**: Tests CSS prop usage in JSX elements.

#### Input

```tsx
import { css } from '@emotion/react'

export class SimpleComponent extends PureComponent {
  render() {
    return (
      <Container
        css={css`
          color: hotpink;
        `}
      >
        <Global
          styles={css`
            html,
            body {
              padding: 3rem 1rem;
              margin: 0;
              background: papayawhip;
              min-height: 100%;
              font-family: Helvetica, Arial, sans-serif;
              font-size: 24px;
            }
          `}
        />
        <span>hello</span>
      </Container>
    )
  }
}
```

#### Transform Code

```ts
import { transform } from '@shuvi/compiler';

const result = await transform(code, {
  emotion: {
    enabled: true,
    sourcemap: true,
    autoLabel: true
  }
});
```

#### Output

```tsx
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { css } from '@emotion/react';

export class SimpleComponent extends PureComponent {
    render() {
        return /*#__PURE__*/ _jsx(Container, {
            css: /*#__PURE__*/ css("color:hotpink;", "SimpleComponent", "/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9vcC5qcyIsInNvdXJjZXMiOlsibm9vcC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJcbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8Q29udGFpbmVyXG4gICAgICAgIGNzcz17Y3NzYFxuICAgICAgICAgIGNvbG9yOiBob3RwaW5rO1xuICAgICAgICBgfVxuICAgICAgICA+XG4gICAgICAgIDxHbG9iYWxcbiAgICAgICAgICBzdHlsZXM9e2Nzc2BcbiAgICAgICAgICAgIGh0bWwsXG4gICAgICAgICAgICBib2R5IHtcbiAgICAgICAgICAgICAgcGFkZGluZzogM3JlbSAxcmVtO1xuICAgICAgICAgICAgICBtYXJnaW46IDA7XG4gICAgICAgICAgICAgIGJhY2tncm91bmQ6IHBhcGF5YXdoaXA7XG4gICAgICAgICAgICAgIG1pbi1oZWlnaHQ6IDEwMCU7XG4gICAgICAgICAgICAgIGZvbnQtZmFtaWx5OiBIZWx2ZXRpY2EsIEFyaWFsLCBzYW5zLXNlcmlmO1xuICAgICAgICAgICAgICBmb250LXNpemU6IDI0cHg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgYFxuICAgICAgICAgIC8+XG4gICAgICAgICAgPHNwYW4+aGVsbG88L3NwYW4+XG4gICAgICAgIDwvQ29udGFpbmVyPlxuICAgIClcbiAgfVxuIn0= */"),
            children: /*#__PURE__*/ _jsxs(_Fragment, {
                children: [/*#__PURE__*/ _jsx(Global, {
                    styles: /*#__PURE__*/ css("html,body{padding:3rem 1rem;margin:0;background:papayawhip;min-height:100%;font-family:Helvetica,Arial,sans-serif;font-size:24px;}", "SimpleComponent", "/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9vcC5qcyIsInNvdXJjZXMiOlsibm9vcC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJcbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8Q29udGFpbmVyXG4gICAgICAgIGNzcz17Y3NzYFxuICAgICAgICAgIGNvbG9yOiBob3RwaW5rO1xuICAgICAgICBgfVxuICAgICAgICA+XG4gICAgICAgIDxHbG9iYWxcbiAgICAgICAgICBzdHlsZXM9e2Nzc2BcbiAgICAgICAgICAgIGh0bWwsXG4gICAgICAgICAgICBib2R5IHtcbiAgICAgICAgICAgICAgcGFkZGluZzogM3JlbSAxcmVtO1xuICAgICAgICAgICAgICBtYXJnaW46IDA7XG4gICAgICAgICAgICAgIGJhY2tncm91bmQ6IHBhcGF5YXdoaXA7XG4gICAgICAgICAgICAgIG1pbi1oZWlnaHQ6IDEwMCU7XG4gICAgICAgICAgICAgIGZvbnQtZmFtaWx5OiBIZWx2ZXRpY2EsIEFyaWFsLCBzYW5zLXNlcmlmO1xuICAgICAgICAgICAgICBmb250LXNpemU6IDI0cHg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgYFxuICAgICAgICAgIC8+XG4gICAgICAgICAgPHNwYW4+aGVsbG88L3NwYW4+XG4gICAgICAgIDwvQ29udGFpbmVyPlxuICAgIClcbiAgfVxuIn0= */")
                }), /*#__PURE__*/ _jsx("span", {
                    children: "hello"
                })]
            })
        });
    }
}
```

### 5. Namespace Import

**Description**: Tests Emotion usage with namespace imports.

#### Input

```tsx
import * as emotionReact from '@emotion/react'
import { PureComponent } from 'react'

const stylesInCallback = (props) =>
  emotionReact.css({
    color: 'red',
    background: 'yellow',
    width: `${props.scale * 100}px`,
  })

const styles = emotionReact.css({
  color: 'red',
  width: '20px',
})

const styles2 = emotionReact.css`
  color: red;
  width: 20px;
`

export class SimpleComponent extends PureComponent {
  render() {
    return (
      <div className={styles}>
        <span>hello</span>
      </div>
    )
  }
}
```

#### Transform Code

```ts
import { transform } from '@shuvi/compiler';

const result = await transform(code, {
  emotion: {
    enabled: true,
    sourcemap: true,
    autoLabel: true
  }
});
```

#### Output

```tsx
import { jsx as _jsx } from "react/jsx-runtime";
import * as emotionReact from '@emotion/react';
import { PureComponent } from 'react';

const stylesInCallback = (props)=>/*#__PURE__*/ emotionReact.css({
        color: 'red',
        background: 'yellow',
        width: `${props.scale * 100}px`
    }, "label:stylesInCallback", "/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9vcC5qcyIsInNvdXJjZXMiOlsibm9vcC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJcbiAgICBpbXBvcnQgKiBhcyBlbW90aW9uUmVhY3QgZnJvbSAnQGVtb3Rpb24vcmVhY3QnXG4gICAgaW1wb3J0IHsgUHVyZUNvbXBvbmVudCB9IGZyb20gJ3JlYWN0J1xuXG4gICAgY29uc3Qgc3R5bGVzSW5DYWxsYmFjayA9IChwcm9wcykgPT5cbiAgICAgIGVtb3Rpb25SZWFjdC5jc3MoXG4gICAgICAgIGNvbG9yOiAncmVkJyxcbiAgICAgICAgYmFja2dyb3VuZDogJ3llbGxvdycsXG4gICAgICAgIHdpZHRoOiBgJHtwcm9wcy5zY2FsZSAqIDEwMH1weGAsXG4gICAgICApXG5cbiAgICBjb25zdCBzdHlsZXMgPSBlbW90aW9uUmVhY3QuY3NzKFxuICAgICAgY29sb3I6ICdyZWQnLFxuICAgICAgd2lkdGg6ICcyMHB4JyxcbiAgICApXG5cbiAgICBjb25zdCBzdHlsZXMyID0gZW1vdGlvblJlYWN0LmNzc2BcbiAgICAgIGNvbG9yOiByZWQ7XG4gICAgICB3aWR0aDogMjBweDtcbiAgICBgXG5cbiAgICBleHBvcnQgY2xhc3MgU2ltcGxlQ29tcG9uZW50IGV4dGVuZHMgUHVyZUNvbXBvbmVudCB7XG4gICAgICByZW5kZXIoKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9e3N0eWxlc30+XG4gICAgICAgICAgICA8c3Bhbj5oZWxsbzwvc3Bhbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKVxuICAgICAgfVxuICAgIH1cbiAgICAiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBT29CIn0= */");
const styles = /*#__PURE__*/ emotionReact.css({
    color: 'red',
    width: '20px'
}, "label:styles", "/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9vcC5qcyIsInNvdXJjZXMiOlsibm9vcC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJcbiAgICBpbXBvcnQgKiBhcyBlbW90aW9uUmVhY3QgZnJvbSAnQGVtb3Rpb24vcmVhY3QnXG4gICAgaW1wb3J0IHsgUHVyZUNvbXBvbmVudCB9IGZyb20gJ3JlYWN0J1xuXG4gICAgY29uc3Qgc3R5bGVzSW5DYWxsYmFjayA9IChwcm9wcykgPT5cbiAgICAgIGVtb3Rpb25SZWFjdC5jc3MoXG4gICAgICAgIGNvbG9yOiAncmVkJyxcbiAgICAgICAgYmFja2dyb3VuZDogJ3llbGxvdycsXG4gICAgICAgIHdpZHRoOiBgJHtwcm9wcy5zY2FsZSAqIDEwMH1weGAsXG4gICAgICApXG5cbiAgICBjb25zdCBzdHlsZXMgPSBlbW90aW9uUmVhY3QuY3NzKFxuICAgICAgY29sb3I6ICdyZWQnLFxuICAgICAgd2lkdGg6ICcyMHB4JyxcbiAgICApXG5cbiAgICBjb25zdCBzdHlsZXMyID0gZW1vdGlvblJlYWN0LmNzc2BcbiAgICAgIGNvbG9yOiByZWQ7XG4gICAgICB3aWR0aDogMjBweDtcbiAgICBgXG5cbiAgICBleHBvcnQgY2xhc3MgU2ltcGxlQ29tcG9uZW50IGV4dGVuZHMgUHVyZUNvbXBvbmVudCB7XG4gICAgICByZW5kZXIoKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9e3N0eWxlc30+XG4gICAgICAgICAgICA8c3Bhbj5oZWxsbzwvc3Bhbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKVxuICAgICAgfVxuICAgIH1cbiAgICAiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBVTRCIn0= */");
const styles2 = /*#__PURE__*/ emotionReact.css("color:red;width:20px;", "label:styles2", "/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9vcC5qcyIsInNvdXJjZXMiOlsibm9vcC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJcbiAgICBpbXBvcnQgKiBhcyBlbW90aW9uUmVhY3QgZnJvbSAnQGVtb3Rpb24vcmVhY3QnXG4gICAgaW1wb3J0IHsgUHVyZUNvbXBvbmVudCB9IGZyb20gJ3JlYWN0J1xuXG4gICAgY29uc3Qgc3R5bGVzSW5DYWxsYmFjayA9IChwcm9wcykgPT5cbiAgICAgIGVtb3Rpb25SZWFjdC5jc3MoXG4gICAgICAgIGNvbG9yOiAncmVkJyxcbiAgICAgICAgYmFja2dyb3VuZDogJ3llbGxvdycsXG4gICAgICAgIHdpZHRoOiBgJHtwcm9wcy5zY2FsZSAqIDEwMH1weGAsXG4gICAgICApXG5cbiAgICBjb25zdCBzdHlsZXMgPSBlbW90aW9uUmVhY3QuY3NzKFxuICAgICAgY29sb3I6ICdyZWQnLFxuICAgICAgd2lkdGg6ICcyMHB4JyxcbiAgICApXG5cbiAgICBjb25zdCBzdHlsZXMyID0gZW1vdGlvblJlYWN0LmNzc2BcbiAgICAgIGNvbG9yOiByZWQ7XG4gICAgICB3aWR0aDogMjBweDtcbiAgICBgXG5cbiAgICBleHBvcnQgY2xhc3MgU2ltcGxlQ29tcG9uZW50IGV4dGVuZHMgUHVyZUNvbXBvbmVudCB7XG4gICAgICByZW5kZXIoKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9e3N0eWxlc30+XG4gICAgICAgICAgICA8c3Bhbj5oZWxsbzwvc3Bhbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKVxuICAgICAgfVxuICAgIH1cbiAgICAiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBbUJ3QiJ9 */");

export class SimpleComponent extends PureComponent {
    render() {
        return /*#__PURE__*/ _jsx("div", {
            className: styles,
            children: /*#__PURE__*/ _jsx("span", {
                children: "hello"
            })
        });
    }
}
```

## Rspack Migration

### Before

When using `@shuvi/compiler`, the Emotion functionality is provided through the built-in SWC transform:

```ts
import { transform } from '@shuvi/compiler';

const result = await transform(code, {
  jsc: {
    transform: {
      react: {
        emotion: {
          sourceMap: true,
          autoLabel: 'dev-only',
          labelFormat: '[local]',
          importSource: '@emotion/react'
        }
      }
    }
  }
});
```

### After

When migrating to Rspack, you can achieve the same Emotion functionality using Rspack's `builtin:swc-loader`. Here are the migration approaches:

#### Option 1: Using Built-in Emotion Support (Recommended)

Rspack's `builtin:swc-loader` has built-in support for Emotion through the React transform:

```js title="rspack.config.mjs"
export default {
  module: {
    rules: [
      {
        test: /\.(js|ts|tsx)$/,
        exclude: [/node_modules/],
        use: {
          loader: 'builtin:swc-loader',
          options: {
            jsc: {
              parser: {
                syntax: 'typescript',
                tsx: true,
              },
              transform: {
                react: {
                  emotion: {
                    sourceMap: true,
                    autoLabel: 'dev-only',
                    labelFormat: '[local]',
                    importSource: '@emotion/react',
                    cssPropOptimization: true,
                    styled: {
                      pure: false
                    }
                  }
                }
              }
            }
          }
        },
        type: 'javascript/auto'
      }
    ]
  }
};
```

#### Option 2: Using SWC Wasm Plugin

For advanced customization, you can use a custom SWC Wasm plugin:

```js title="rspack.config.mjs"
export default {
  module: {
    rules: [
      {
        test: /\.(js|ts|tsx)$/,
        exclude: [/node_modules/],
        use: {
          loader: 'builtin:swc-loader',
          options: {
            jsc: {
              parser: {
                syntax: 'typescript',
                tsx: true,
              },
              experimental: {
                plugins: [
                  [
                    '@swc/plugin-emotion',
                    {
                      sourceMap: true,
                      autoLabel: 'dev-only',
                      labelFormat: '[local]',
                      importSource: '@emotion/react'
                    }
                  ]
                ]
              }
            }
          }
        },
        type: 'javascript/auto'
      }
    ]
  }
};
```

#### Option 3: Custom SWC Plugin Implementation

If you need to implement custom Emotion behavior, create a custom SWC Wasm plugin:

##### Step 1: Create the SWC Plugin Project

```bash
# Create a new directory for your plugin
mkdir swc-plugin-emotion-custom
cd swc-plugin-emotion-custom

# Initialize a new Rust project
cargo init --lib
```

##### Step 2: Configure Cargo.toml

```toml title="Cargo.toml"
[package]
name = "swc-plugin-emotion-custom"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib"]

[dependencies]
swc_atoms = "0.5"
swc_common = "0.32"
swc_ecmascript = "0.200"
```

##### Step 3: Implement the Plugin

```rust title="src/lib.rs"
use swc_atoms::JsWord;
use swc_ecmascript::ast::{JSXElement, JSXAttr, JSXAttrValue, JSXExprContainer, Expr};
use swc_ecmascript::visit::Fold;

pub fn emotion_transform(config: EmotionConfig) -> impl Fold {
    EmotionTransform {
        config,
    }
}

#[derive(Debug, Clone)]
pub struct EmotionConfig {
    pub source_map: bool,
    pub auto_label: String,
    pub label_format: String,
    pub import_source: String,
}

#[derive(Debug)]
struct EmotionTransform {
    config: EmotionConfig,
}

impl Fold for EmotionTransform {
    fn fold_jsx_element(&mut self, element: JSXElement) -> JSXElement {
        // Transform CSS props and styled components
        // Implementation details would go here
        element
    }
}

// SWC Plugin Entry Point
#[no_mangle]
pub fn create_plugin() -> *mut swc_common::plugin::Plugin {
    let plugin = swc_common::plugin::Plugin::new(
        "emotion-custom".to_string(),
        Box::new(|config| {
            let source_map = config
                .get("sourceMap")
                .and_then(|v| v.as_bool())
                .unwrap_or(false);
            
            let auto_label = config
                .get("autoLabel")
                .and_then(|v| v.as_str())
                .unwrap_or("dev-only")
                .to_string();
            
            let label_format = config
                .get("labelFormat")
                .and_then(|v| v.as_str())
                .unwrap_or("[local]")
                .to_string();
            
            let import_source = config
                .get("importSource")
                .and_then(|v| v.as_str())
                .unwrap_or("@emotion/react")
                .to_string();
            
            let emotion_config = EmotionConfig {
                source_map,
                auto_label,
                label_format,
                import_source,
            };
            
            Box::new(emotion_transform(emotion_config))
        }),
    );
    
    Box::into_raw(plugin)
}
```

##### Step 4: Build and Configure

Follow the same build and configuration steps as shown in the auto-css-modules migration section.

### Migration Benefits

1. **Performance**: Rspack's `builtin:swc-loader` provides better performance with Rust implementation
2. **Native Integration**: Direct integration with Rspack's build pipeline
3. **Built-in Support**: Emotion support is built into SWC, no additional plugins needed
4. **Type Safety**: Better TypeScript support with proper type definitions

### Configuration Comparison

| Feature | @shuvi/compiler | Rspack Migration |
|---------|-----------------|------------------|
| CSS Prop Support | ✅ | ✅ |
| Styled Components | ✅ | ✅ |
| Source Maps | ✅ | ✅ |
| Auto Labels | ✅ | ✅ |
| Theme Support | ✅ | ✅ |
| Dynamic Styling | ✅ | ✅ |
| Performance | Good | Better (Rust implementation) |

### TypeScript Support

For TypeScript projects, ensure proper type definitions:

```ts title="rspack.config.ts"
import type { SwcLoaderOptions } from '@rspack/core';

export default {
  module: {
    rules: [
      {
        test: /\.(js|ts|tsx)$/,
        use: {
          loader: 'builtin:swc-loader',
          options: {
            jsc: {
              parser: {
                syntax: 'typescript',
                tsx: true,
              },
              transform: {
                react: {
                  emotion: {
                    sourceMap: true,
                    autoLabel: 'dev-only',
                    labelFormat: '[local]',
                    importSource: '@emotion/react',
                    cssPropOptimization: true,
                    styled: {
                      pure: false
                    }
                  }
                }
              }
            }
          } satisfies SwcLoaderOptions
        }
      }
    ]
  }
};
```

### Advanced Configuration

#### Development vs Production

```js title="rspack.config.mjs"
const isDevelopment = process.env.NODE_ENV === 'development';

export default {
  module: {
    rules: [
      {
        test: /\.(js|ts|tsx)$/,
        use: {
          loader: 'builtin:swc-loader',
          options: {
            jsc: {
              transform: {
                react: {
                  emotion: {
                    sourceMap: isDevelopment,
                    autoLabel: isDevelopment ? 'dev-only' : 'never',
                    labelFormat: '[local]',
                    importSource: '@emotion/react',
                    cssPropOptimization: !isDevelopment,
                    styled: {
                      pure: !isDevelopment
                    }
                  }
                }
              }
            }
          }
        }
      }
    ]
  }
};
```

#### Multiple Emotion Configurations

For projects with different Emotion configurations for different file types:

```js title="rspack.config.mjs"
export default {
  module: {
    rules: [
      {
        test: /\.(js|ts|tsx)$/,
        use: {
          loader: 'builtin:swc-loader',
          options: {
            jsc: {
              transform: {
                react: {
                  emotion: {
                    sourceMap: true,
                    autoLabel: 'dev-only',
                    labelFormat: '[local]',
                    importSource: '@emotion/react'
                  }
                }
              }
            }
          }
        }
      },
      {
        test: /\.(js|ts|tsx)$/,
        include: [/src\/legacy/],
        use: {
          loader: 'builtin:swc-loader',
          options: {
            jsc: {
              transform: {
                react: {
                  emotion: {
                    sourceMap: false,
                    autoLabel: 'never',
                    importSource: '@emotion/react'
                  }
                }
              }
            }
          }
        }
      }
    ]
  }
};
```

### Troubleshooting

#### Common Issues

1. **Import Source Mismatch**: Ensure `importSource` matches your Emotion package
2. **CSS Prop Not Working**: Check that `cssPropOptimization` is enabled
3. **Styled Components Not Transforming**: Verify `styled` configuration
4. **Source Maps Not Working**: Ensure `sourceMap` is set to `true`

#### Performance Optimization

1. **Disable Source Maps in Production**: Set `sourceMap: false` for production builds
2. **Use Pure Annotations**: Enable `styled.pure: true` for better tree shaking
3. **Optimize CSS Props**: Keep `cssPropOptimization: true` for better performance
4. **Cache Configuration**: Use Rspack's built-in caching for faster rebuilds

#### Debugging

Enable detailed logging for debugging Emotion transformations:

```js title="rspack.config.mjs"
export default {
  module: {
    rules: [
      {
        test: /\.(js|ts|tsx)$/,
        use: {
          loader: 'builtin:swc-loader',
          options: {
            jsc: {
              transform: {
                react: {
                  emotion: {
                    sourceMap: true,
                    autoLabel: 'dev-only',
                    labelFormat: '[local]',
                    importSource: '@emotion/react'
                  }
                }
              }
            }
          }
        }
      }
    ]
  },
  infrastructureLogging: {
    level: 'verbose'
  }
};
```
