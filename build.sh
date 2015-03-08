#!/bin/bash
rm -rf ./build
./node_modules/.bin/6to5 --experimental ./lib --out-dir ./build
find ./build -type f -name '*.jsx' -exec sh -c 'mv -f $0 ${0%.jsx}.js' {} \;
