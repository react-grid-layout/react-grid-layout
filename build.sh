#!/bin/bash
rm -rf ./build
./node_modules/.bin/babel --experimental ./lib --out-dir ./build
# More cross-platform compatible than `rename`
find ./build -type f -name '*.jsx' -exec sh -c 'mv -f $0 ${0%.jsx}.js' {} \;
