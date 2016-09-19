# @file: Karma 测试构建配置文件
# @author: yangjun14(yangjun14@baidu.com)

export PORT=9877

export KARMA_BIN=./node_modules/karma/bin/karma

export TEST=$(KARMA_BIN) --port $(PORT)

.PHONY: test test-reports test-watch test-run test-listen test-build clean dist-clean

test: test-build
	$(TEST) start --reporters mocha

test-reports: test-build
	$(TEST) start --reporters mocha,html,coverage

test-watch: test-build
	$(TEST) start --auto-watch --no-single-run

test-listen: test-build
	$(TEST) start --browsers --no-single-run

test-run:
	$(TEST) run

test-build: 
	[ -d ./build ] || mkdir ./build 
	fis3 release -d ./build

clean:
	rm -rf ./build/

dist-clean: clean
	rm -rf ./dist/
