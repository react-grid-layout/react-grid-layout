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
	@$(BIN)/webpack-dev-server --config webpack-dev-server.config.js \
	  --hot --progress --colors

# Allows usage of `make install`, `make link`
install link:
	@npm $@

# Build browser module
dist/%.min.js: $(LIB) $(BIN)
	@$(BIN)/webpack

build-js:
	@$(BIN)/babel --out-dir $(BUILD) $(LIB)

# Will build for use on github pages. Full url of page is
# https://strml.github.io/react-grid-layout/examples/0-showcase.html
# so the CONTENT_BASE should adapt.
build-example:
	@$(BIN)/webpack --config webpack-examples.config.js
	env CONTENT_BASE="/react-grid-layout/examples/" node ./examples/generate.js

view-example:
	env CONTENT_BASE="/examples/" node ./examples/generate.js
	@$(BIN)/webpack-dev-server --config webpack-examples.config.js --progress --colors

# FIXME flow is usually global
lint:
	@$(BIN)/flow
	@$(BIN)/eslint --ext .js,.jsx $(LIB) $(TEST)

test:
	env NODE_ENV=test $(BIN)/jest

test-watch:
	env NODE_ENV=test $(BIN)/jest --watch

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
