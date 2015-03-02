.PHONY: js html check-build

all: js html

js:
	bash build.sh

html:
	node ./examples/generate.js

check-build:
	bash check-build.sh
