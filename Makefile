# @author: yangjun14(yangjun14@baidu.com)
# Use npm scripts instead

# Variables

export PORT=9877
export KARMA_BIN=./node_modules/karma/bin/karma
export TEST=$(KARMA_BIN) --port $(PORT)
export DOC=./bin/doc.js
export NAME=$(shell node -p 'require("./package.json").name')
export VERSION=$(shell node -p 'require("./package.json").version')
export DESCRIPTION=$(shell node -p 'require("./package.json").description')

.PHONY: test dist doc


# Build Related

build-prepare:
	rm -rf ./build/
	[ -d ./build ] || mkdir ./build 

build-dev: build-prepare
	fis3 release -d ./build

build/banner.js: build-prepare
	echo '/*' > $@
	echo ' * Superframe' >> $@
	echo ' * Version: '$(NAME)-$(VERSION) >> $@
	echo ' * Homepage: http://superframe.baidu.com' >> $@
	echo ' * Build Date: '`date --iso-8601=seconds` >> $@
	echo " * Commit Hash: "`git rev-parse HEAD` >> $@
	echo ' * Commit Message: '`git log -1 --oneline | sed "s/\*//g"` >> $@
	echo ' */' >> $@

build-prod: build-prepare
	fis3 release prod -d ./build

dist-prepare: 
	[ -d ./dist ] || mkdir ./dist

# use `npm run dist` instead!
dist: build-prod dist-prepare build/banner.js
	cat build/banner.js > dist/$(NAME).js
	cat build/src/main.js >> dist/$(NAME).js
	cat build/banner.js > dist/$(NAME).min.js
	cat build/src/main.min.js >> dist/$(NAME).min.js
	cp dist/$(NAME).js dist/$(NAME)-$(VERSION).js
	cp dist/$(NAME).min.js dist/$(NAME)-$(VERSION).min.js

doc:
	rm -rf ./docs
	mkdir ./docs
	$(DOC) src/lang/promise.js > docs/promise.md
	$(DOC) src/lang/underscore.js > docs/underscore.md
	$(DOC) src/utils/http.js > docs/http.md
	$(DOC) src/utils/cache.js > docs/cache.md
	$(DOC) src/utils/emitter.js > docs/emitter.md
	$(DOC) src/utils/url.js > docs/url.md
	$(DOC) src/resource.js > docs/resource.md
	$(DOC) src/action.js > docs/action.md
	$(DOC) src/router/router.js > docs/router.md
	$(DOC) src/utils/url.js > docs/url.md
	$(DOC) src/service.js > docs/service.md
	$(DOC) src/view.js > docs/view.md

clean:
	rm -rf ./build/

dist-clean: clean
	rm -rf ./dist/


# Test Related

test: build-dev
	$(TEST) start --reporters mocha

test-reports: build-dev
	$(TEST) start --reporters mocha,html,coverage

test-watch: build-dev
	$(TEST) start --auto-watch --no-single-run

test-listen: build-dev
	$(TEST) start --browsers --no-single-run

test-run:
	$(TEST) run
