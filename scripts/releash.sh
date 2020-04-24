#!/bin/bash
set -e

# build
yarn build

# test
if [[ -z $SKIP_TESTS ]]; then
  yarn test
fi

# tag version
yarn run lerna version $@

# publish
if [[ -z $RELEASE_TAG ]]; then
  yarn run lerna publish from-package --registry=https://registry.npmjs.org
else
  yarn run lerna publish from-package --registry=https://registry.npmjs.org --dist-tag "$RELEASE_TAG"
fi

