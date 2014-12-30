.PHONY: js

js:
	jsx ./lib ./build --harmony -x jsx --no-cache-dir
	cp -R ./lib/*.js ./build

check-build:
	bash check-build.sh
