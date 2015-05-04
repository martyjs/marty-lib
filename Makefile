BIN = ./node_modules/.bin

.PHONY: bootstrap test test-server test-browser;

SRC = $(shell find ./src -type f -name '*.js')

test: lint test-server test-browser

test-server:
	@$(BIN)/mocha -r test/server/setup -t 10000 src/isomorphism/__tests__

build:
	@rm -rf ./modules
	@mkdir -p ./modules
	@$(BIN)/babel ./src -d ./modules

watch:
	@rm -rf ./modules
	@mkdir -p ./modules
	@$(BIN)/babel -w ./src -d ./modules

test-browser:
	@$(BIN)/karma start --single-run

test-watch:
	@$(BIN)/karma start

bootstrap: package.json
	@npm install

lint:
	@$(BIN)/jscs --esprima=esprima-fb $(SRC);
	@$(BIN)/jsxhint $(SRC);

