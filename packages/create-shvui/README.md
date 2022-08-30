# Create Shuvi

The easiest way to get started with Shuvi.js is by using `create-shuvi`. This CLI tool enables you to quickly start building a new Shuvi.js application, with everything set up for you. You can create a new app using the default Shuvi.js template, or by using one of the [official Shuvi.js examples](https://github.com/shuvijs/shuvi/tree/main/examples). To get started, use the following command:

```bash
npx create-shuvi@latest
# or
yarn create shuvi
# or
pnpm create shuvi
```

Or, for a TypeScript project:

```bash
npx create-shuvi@latest --typescript
# or
yarn create shuvi --typescript
# or
pnpm create shuvi --typescript
```

To create a new app in a specific folder, you can send a name as an argument. For example, the following command will create a new Shuvi.js app called `my-first-app` in a folder with the same name:

```bash
npx create-shuvi@latest my-first-app
# or
yarn create shuvi my-first-app
# or
pnpm create shuvi my-first-app
```

## Options

`create-shuvi` comes with the following options:

- **--ts, --typescript** - Initialize as a TypeScript project.
- **-e, --example [name]|[github-url]** - An example to bootstrap the app with. You can use an example name from the [Shuvi.js repo](https://github.com/shuvijs/shuvi/tree/main/examples) or a GitHub URL. The URL can use any branch and/or subdirectory.
- **--example-path &lt;path-to-example&gt;** - In a rare case, your GitHub URL might contain a branch name with a slash (e.g. bug/fix-1) and the path to the example (e.g. foo/bar). In this case, you must specify the path to the example separately: `--example-path foo/bar`
- **--use-npm** - Explicitly tell the CLI to bootstrap the app using npm. To bootstrap using yarn we recommend to run `yarn create shuvi`
- **--use-pnpm** - Explicitly tell the CLI to bootstrap the app using pnpm. To bootstrap using pnpm we recommend running `pnpm create shuvi`

## Why use Create Shuvi App?

`create-shuvi` allows you to create a new Shuvi.js app within seconds. It is officially maintained by the creators of Shuvi.js, and includes a number of benefits:

- **Interactive Experience**: Running `npx create-shuvi` (with no arguments) launches an interactive experience that guides you through setting up a project.
- **Zero Dependencies**: Initializing a project is as quick as one second. Create Shuvi App has zero dependencies.
- **Offline Support**: Create Shuvi App will automatically detect if you're offline and bootstrap your project using your local package cache.
- **Support for Examples**: Create Shuvi App can bootstrap your application using an example from the Shuvi.js examples collection (e.g. `npx create-shuvi --example basic`).
