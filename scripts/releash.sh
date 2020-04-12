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
yarn run lerna publish from-package --registry=https://registry.npmjs.org
