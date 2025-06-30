# @shuvi/swc-plugin-auto-css-modules

SWC plugin that automatically transforms CSS file imports with named specifiers and appends a query parameter to enable CSS modules processing.

## Overview

The Auto CSS Modules plugin is a SWC transform that automatically detects CSS file imports with named specifiers and appends a query parameter to enable CSS modules processing. The plugin intelligently distinguishes between named imports (which should be transformed) and side-effect imports (which should remain unchanged).

## Features

- **Automatic CSS Detection**: Supports `.css`, `.less`, `.scss`, `.sass` file extensions
- **Named Import Only**: Only transforms imports with named specifiers, ignores side-effect imports
- **Customizable Flag**: Configurable query parameter flag (defaults to `cssmodules`)
- **Dynamic Import Support**: Handles `import()` dynamic imports
- **Non-CSS Safe**: Never transforms non-CSS file imports

## Installation

```bash
# Install the plugin
pnpm add @shuvi/swc-plugin-auto-css-modules
```

## Usage

### Basic Configuration

```javascript
// swc.config.js
module.exports = {
  plugins: [
    ["@shuvi/swc-plugin-auto-css-modules", { "cssModuleFlag": "cssmodules" }]
  ]
};
```

### Custom Flag Configuration

```javascript
// swc.config.js
module.exports = {
  plugins: [
    ["@shuvi/swc-plugin-auto-css-modules", { "cssModuleFlag": "modules" }]
  ]
};
```

## API

### Configuration

| Option          | Type     | Default        | Description                                       |
| --------------- | -------- | -------------- | ------------------------------------------------- |
| `cssModuleFlag` | `string` | `'cssmodules'` | The query parameter flag to append to CSS imports |

## Behavior Specification

### 1. CSS Modules Transformation

The plugin transforms named imports of CSS files by appending a query parameter.

#### Supported CSS Extensions

- `.css` - Standard CSS files
- `.less` - Less preprocessor files
- `.scss` - SCSS preprocessor files
- `.sass` - Sass preprocessor files

#### Transformation Rules

- **Named Imports**: Only imports with named specifiers are transformed
- **Query Parameter**: Appends `?cssmodules` by default, or custom flag if specified
- **File Extension Detection**: Only processes files with supported CSS extensions

### 2. Side-effect Imports

Side-effect imports (imports without named specifiers) are **not transformed** and remain unchanged.

### 3. Non-CSS Imports

Imports of non-CSS files are **never transformed**, regardless of import type.

## Examples

### Basic CSS Modules Transformation

**Input:**
```javascript
import styles from 'a.css';
import styles from 'a.less';
import styles from 'a.scss';
import styles from 'a.sass';
```

**Output:**
```javascript
import styles from 'a.css?cssmodules';
import styles from 'a.less?cssmodules';
import styles from 'a.scss?cssmodules';
import styles from 'a.sass?cssmodules';
```

### Custom CSS Module Flag

**Input:**
```javascript
import styles from 'a.css';
```

**Configuration:**
```javascript
{
  "cssModuleFlag": "foo"
}
```

**Output:**
```javascript
import styles from 'a.css?foo';
```

### Side-effect CSS Imports

**Input:**
```javascript
import 'a.css';
```

**Output:**
```javascript
import 'a.css'; // Unchanged
```

### Non-CSS Imports

**Input:**
```javascript
import a from 'a';
import a from 'a.js';
import 'a';
```

**Output:**
```javascript
import a from 'a'; // Unchanged
import a from 'a.js'; // Unchanged
import 'a'; // Unchanged
```

### Dynamic Imports

**Input:**
```javascript
import('a.css').then(module => {
  // use module
});
```

**Output:**
```javascript
import('a.css?cssmodules').then(module => {
  // use module
});
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