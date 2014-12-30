.PHONY: js

js:
	rm -rf ./build
	./node_modules/.bin/6to5 --experimental ./lib --out-dir ./build
	rename 's/jsx$$/js/' ./build/*

check-build:
	bash check-build.sh
