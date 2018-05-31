.DELETE_ON_ERROR:

export BIN := $(shell npm bin)
PATH := $(BIN):$(PATH)
DIST = ./dist
BUILD = ./build
LIB = ./lib
TEST = ./test
MIN = $(DIST)/react-grid-layout.min.js
MIN_MAP = $(DIST)/react-grid-layout.min.js.map

.PHONY: test dev lint build clean install link


build: clean build-js $(MIN)

clean:
	rm -rf $(BUILD) $(DIST)

dev:
	@$(BIN)/webpack-dev-server --config webpack-dev-server.config.js --hot --progress --colors --port 4002 --open --content-base .

# Allows usage of `make install`, `make link`
install link:
	@npm $@

# Build browser module
dist/%.min.js: $(LIB) $(BIN)
	@$(BIN)/webpack

# find/exec is more cross-platform compatible than `rename`
build-js:
	@$(BIN)/babel --stage 0 --out-dir $(BUILD) $(LIB)

build-example:
	@$(BIN)/webpack --config webpack-examples.config.js
	node ./examples/generate.js

view-example: build-example
	@$(BIN)/opener examples/0-showcase.html


# FIXME flow is usually global
lint:
	./node_modules/.bin/flow
	@$(BIN)/eslint --ext .js,.jsx $(LIB) $(TEST)
	@$(BIN)/valiquire $(LIB)

test:
	@$(BIN)/jest

release-patch: build lint test
	@$(call release,patch)

release-minor: build lint test
	@$(call release,minor)

release-major: build lint test
	@$(call release,major)

publish:
	git push --tags origin HEAD:master
	npm publish

define release
	VERSION=`node -pe "require('./package.json').version"` && \
	NEXT_VERSION=`node -pe "require('semver').inc(\"$$VERSION\", '$(1)')"` && \
	node -e "\
		['./package.json'].forEach(function(fileName) {\
			var j = require(fileName);\
			j.version = \"$$NEXT_VERSION\";\
			var s = JSON.stringify(j, null, 2);\
			require('fs').writeFileSync(fileName, s);\
		});" && \
	git add package.json CHANGELOG.md $(MIN) $(MIN_MAP) && \
	git commit -m "release $$NEXT_VERSION" && \
	git tag "$$NEXT_VERSION" -m "release $$NEXT_VERSION"
endef
