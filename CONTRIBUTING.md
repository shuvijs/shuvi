# Contributing to Shuvi

Please take a moment to review this document in order to make the contribution process straightforward and effective for everyone involved.

Following these guidelines helps to communicate that you respect the time of the developers managing and developing this open source project. In return, they should reciprocate that respect in addressing your issue or assessing patches and features.

## Core Ideas

Write less code, Let shuvi do more.

## Folder Structure

`shuvi` is a monorepo, meaning it is divided into independent sub-packages.<br>
These packages can be found in the [`packages/`](https://github.com/liximomo/shuvi/tree/master/packages) directory.

### app

Type definitions for shuvi application.

### core

Core components.

### runtime-core

Core runtime of application.

### platform-react

React runtime for application.

### shuvi

Assemble other packages for setting up the development server, building production builds.

### shared

Reusable logic within the project.

### utils

Generally reusable logic.

### toolpack

configuring for webpack, babel, etc.

### types

Type definitions for shuvi.

## Setting Up a Local Copy

1. Clone the repo with `git clone https://github.com/liximomo/shuvi`

2. Run `pnpm i` in the root folder.

3. Run `pnpm build` in the root folder.

### Local Development

1. Open two terminal at the root folder.

2. Run `pnpm dev`

Once it is done, you can run shuvi cli by `pnpm shuvi` in another terminal. It will serve the application in the specified dir.

e.g.

```
pnpm shuvi dev test/fixtures/basic
```

## About Publishing

Shuvi uses [changesets](https://github.com/changesets/changesets) to manage monorepo versions and publish.

### For Developers

After writing code and complete test, run `pnpm changeset` to add a changeset, or run `pnpm changeset pre enter xxx` to add a changeset with prereleases version. And then bring this changeset file to git.
