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
	@$(BIN)/webpack serve --config webpack-dev-server.config.js \
	  --hot --progress

# Allows usage of `make install`, `make link`
install link:
	@npm $@

# Build browser module
dist/%.min.js: $(LIB) $(BIN)
	@$(BIN)/webpack

build-js:
	@$(BIN)/babel --out-dir $(BUILD) $(LIB)

# Will build for use on github pages. Full url of page is
# https://react-grid-layout.github.io/react-grid-layout/examples/0-showcase.html
# so the CONTENT_BASE should adapt.
build-example:
	@$(BIN)/webpack --config webpack-examples.config.js
	env CONTENT_BASE="/react-grid-layout/examples/" node ./examples/generate.js

# Note: this doesn't hot reload, you need to re-run to update files.
# TODO fix that
view-example:
	env CONTENT_BASE="/react-grid-layout/examples/" node ./examples/generate.js
	@$(BIN)/webpack serve --config webpack-examples.config.js --progress

# FIXME flow is usually global
lint:
	@$(BIN)/flow
	@$(BIN)/eslint --ext .js,.jsx

test:
	env NODE_ENV=test $(BIN)/jest --coverage

test-watch:
	env NODE_ENV=test $(BIN)/jest --watch

test-update-snapshots:
	env NODE_ENV=test $(BIN)/jest --updateSnapshot

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
	npm pack --dry-run
endef
