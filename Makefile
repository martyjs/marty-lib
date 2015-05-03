BIN = ./node_modules/.bin

.PHONY: bootstrap test test-server test-browser;

SRC = $(shell find ./modules -type f -name '*.js')

test: lint test-server test-browser

test-server:
	@$(BIN)/mocha -r test/server/setup -t 10000 modules/isomorphism/__tests__

build-server:
	@mkdir -p dist/node
	@rm -rf dist/node
	@$(BIN)/babel -d dist/node $(ES6_SRC)

test-browser:
	@$(BIN)/karma start --single-run

test-watch:
	@$(BIN)/karma start

bootstrap: package.json
	@npm install

lint:
	@$(BIN)/jscs --esprima=esprima-fb $(SRC);
	@$(BIN)/jsxhint $(SRC);

watch:
	@mkdir -p dist
	@$(BIN)/babel -w -d dist/node $(ES6_SRC)