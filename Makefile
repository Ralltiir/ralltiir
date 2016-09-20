# @file: Build & Test 
# @author: yangjun14(yangjun14@baidu.com)


# Variables

export PORT=9877

export KARMA_BIN=./node_modules/karma/bin/karma

export TEST=$(KARMA_BIN) --port $(PORT)

.PHONY: test test-reports test-watch test-run test-listen build dist clean dist-clean


# Build Related

build: 
	[ -d ./build ] || mkdir ./build 
	fis3 release -d ./build

dist: build 
	[ -d ./dist ] || mkdir ./dist
	cp ./build/src/main.js ./dist/sf.js
	cp ./build/src/main.min.js ./dist/sf.min.js

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
