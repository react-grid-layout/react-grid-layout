#!/bin/bash
rm -rf ./build
$(npm bin)/babel --stage 0 --out-dir ./build ./lib
# More cross-platform compatible than `rename`
find ./build -type f -name '*.jsx' -exec sh -c 'mv -f $0 ${0%.jsx}.js' {} \;

# Build browser module
$(npm bin)/webpack
