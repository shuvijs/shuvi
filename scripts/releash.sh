#!/bin/bash
set -e

yarn run lerna version $@

yarn run lerna publish from-package --registry=https://registry.npmjs.org
