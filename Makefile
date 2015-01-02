.PHONY: js html check-build

all: js html

js:
	rm -rf ./build
	./node_modules/.bin/6to5 --experimental ./lib --out-dir ./build
	rename 's/jsx$$/js/' ./build/*

html:
	node ./examples/generate.js

check-build:
	bash check-build.sh
