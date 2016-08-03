# @file: Karma 测试构建配置文件
# @author: yangjun14(yangjun14@baidu.com)

export PORT=9877

export KARMA_BIN=./node_modules/karma/bin/karma

export TEST=$(KARMA_BIN) --port $(PORT)

.PHONY: test coverage html reports watch clean build

test: build
	$(TEST) start --reporters mocha

coverage: build
	$(TEST) start --reporters mocha,coverage

html: build
	$(TEST) start --reporters mocha,html

reports: build
	$(TEST) start --reporters mocha,html,coverage

watch: build
	$(TEST) start --auto-watch --no-single-run

listen: build
	$(TEST) start --browsers --no-single-run

run:
	$(TEST) run

build: 
	-mkdir build 
	fis3 release -d ./build/dist

clean:
	rm -rf ./build/
