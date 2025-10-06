# @shuvi/swc-plugin-disallow-re-export-all-in-page

SWC plugin that disallows the use of `export * from '...'` statements in page files to prevent issues with code splitting and tree shaking.

## Overview

The Disallow Re-Export All In Page plugin is a SWC transform that prevents the use of `export * from '...'` statements in page files. These statements can cause issues with modern bundlers' code splitting and tree shaking capabilities, leading to larger bundle sizes and reduced performance.

## Features

- **Export Statement Detection**: Detects and reports errors for `export * from '...'` statements
- **Customizable Error Messages**: Configurable error messages for better developer experience
- **Enable/Disable Support**: Can be enabled or disabled via configuration
- **Namespace Export Support**: Handles both named and namespace re-exports
- **Precise Error Reporting**: Provides exact line and column location of problematic code

## Installation

```bash
# Install the plugin
pnpm add @shuvi/swc-plugin-disallow-re-export-all-in-page
```

## Usage

### Basic Configuration

```javascript
// swc.config.js
module.exports = {
  plugins: [
    ["@shuvi/swc-plugin-disallow-re-export-all-in-page"]
  ]
};
```

### With Custom Configuration

```javascript
// swc.config.js
module.exports = {
  plugins: [
    [
      "@shuvi/swc-plugin-disallow-re-export-all-in-page",
      {
        enabled: true,
        message: "Custom error message for export * statements"
      }
    ]
  ]
};
```

## API

### Configuration

| Option    | Type      | Default                                                                                                 | Description                    |
| --------- | --------- | ------------------------------------------------------------------------------------------------------- | ------------------------------ |
| `enabled` | `boolean` | `true`                                                                                                  | Enable or disable the plugin   |
| `message` | `string`  | `"Using \`export * from '...'\` in a page is disallowed. Please use \`export { default } from '...'\` instead."` | Custom error message |

## Behavior Specification

### 1. Disallowed Export Statements

The plugin detects and reports errors for the following export patterns:

- `export * from '...'` - Re-exports all exports from a module
- `export * as namespace from '...'` - Re-exports all exports as a namespace

### 2. Allowed Export Statements

The following export patterns are allowed and will not trigger errors:

- `export { name } from '...'` - Named re-exports
- `export { default } from '...'` - Default re-exports
- `export const name = value` - Direct exports
- `export default function() {}` - Default function exports
- `export default class {}` - Default class exports

### 3. Error Reporting

When a disallowed export statement is detected, the plugin reports an error with:
- The configured error message (or default message)
- Exact line and column location of the problematic code
- File path information

## Examples

### Disallowed Patterns

**Input:**
```typescript
// These will trigger errors
export * from './module';
export * as ns from './module';
```

**Output:**
```
Error: Using `export * from '...'` in a page is disallowed. Please use `export { default } from '...'` instead.
  at line 2, column 1 in /path/to/file.ts
```

### Allowed Patterns

**Input:**
```typescript
// These are allowed and will not trigger errors
export { foo } from './module';
export { default } from './module';
export const bar = 'baz';
export default function() {}
export default class MyClass {}
```

**Output:**
```typescript
// No errors - code remains unchanged
export { foo } from './module';
export { default } from './module';
export const bar = 'baz';
export default function() {}
export default class MyClass {}
```

### Disable Plugin

**Configuration:**
```javascript
{
  "enabled": false
}
```

**Input:**
```typescript
export * from './module';
```

**Output:**
```typescript
// No errors - plugin is disabled
export * from './module';
```

### Custom Error Message

**Configuration:**
```javascript
{
  "message": "Re-exporting all exports is not allowed in page files. Use specific named exports instead."
}
```

**Input:**
```typescript
export * from './module';
```

**Output:**
```
Error: Re-exporting all exports is not allowed in page files. Use specific named exports instead.
  at line 1, column 1 in /path/to/file.ts
```

## Development

### Building

```bash
# Build release version
pnpm run build

# Build debug version
pnpm run build:debug
```

### Testing

```bash
# Run tests
pnpm run test
```

## License

MIT 