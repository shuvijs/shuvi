# Shuvi

Meta Framework to create applications quickly.

## Features

- Automatic transpilation and bundling (with webpack and babel)
- On demand transpilation / Hot code reloading
- Code splitting for every pages
- Server-Side Rendering

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for more information on what we're looking for and how to get started.

## Credits

Some implementation of shuvi.js are inspired by existing projects, such as next.js and umi.js. Thanks for them.

## SWC Plugins

### Prerequisites

```
rustup install 1.87.0
rustup override set 1.87.0
rustup target add wasm32-unknown-unknown
cargo check
cargo build --target wasm32-unknown-unknown --release
```

If success, you can use the output wasm file in the `target/wasm32-unknown-unknown/release/swc_plugin_remove_console.wasm`.

### Check version

```
$ node -v
v18.20.4

$ pnpm -v
8.9.2

$ rustc --version
rustc 1.87.0 (17067e9ac 2025-05-09)
```

### Build

```
pnpm build
```

### Test

```
cargo test
```
