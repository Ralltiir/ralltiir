# @file: Build & Test 
# @author: yangjun14(yangjun14@baidu.com)


# Variables

export PORT=9877
export KARMA_BIN=./node_modules/karma/bin/karma
export TEST=$(KARMA_BIN) --port $(PORT)
export DOC=node ./bin/doc.js
export VERSION=2.5

.PHONY: test test-reports test-watch test-run test-listen build dist clean dist-clean doc


# Build Related

build: 
	rm -rf ./build
	mkdir ./build 
	fis3 release -d ./build

dist: 
	rm -rf ./build
	mkdir ./build 
	fis3 release prod -d ./build
	cp ./build/src/main.js ./dist/sf-$(VERSION).js
	cp ./build/src/main.min.js ./dist/sf-$(VERSION).min.js

doc:
	-mkdir docs
	$(DOC) src/utils/promise.js > docs/promise.md
	$(DOC) src/utils/underscore.js > docs/underscore.md
	$(DOC) src/utils/http.js > docs/http.md
	$(DOC) src/resource.js > docs/resource.md
	$(DOC) src/action.js > docs/action.md
	$(DOC) src/router/router.js > docs/router.md
	$(DOC) src/utils/dom.js > docs/dom.md
	$(DOC) src/service.js > docs/service.md
	$(DOC) src/view.js > docs/view.md

clean:
	rm -rf ./build/

dist-clean: clean
	rm -rf ./dist/


# Test Related

test: build
	$(TEST) start --reporters mocha

test-reports: build
	$(TEST) start --reporters mocha,html,coverage

test-watch: build
	$(TEST) start --auto-watch --no-single-run

test-listen: build
	$(TEST) start --browsers --no-single-run

test-run:
	$(TEST) run
