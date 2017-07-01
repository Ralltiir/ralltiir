# @author: yangjun14(yangjun14@baidu.com)
# Use npm scripts instead

# Variables

export PATH := $(shell npm bin):$(PATH)
export PORT = 9877
export TEST = karma --port $(PORT)
export DOC = jsdoc2md
export NAME = $(shell node -p 'require("./package.json").name')
export VERSION = $(shell node -p 'require("./package.json").version')
export DESCRIPTION = $(shell node -p 'require("./package.json").description')

.PHONY: test dist doc

# Build Related

build-prepare:
	rm -rf ./build/
	[ -d ./build ] || mkdir ./build

build-dev: build-prepare
	./node_modules/.bin/fis3 release -d ./build

build/banner.js: build-prepare
	echo '/*' > $@
	echo ' * Superframe' >> $@
	echo ' * Version: '$(NAME)-$(VERSION) >> $@
	echo ' * Homepage: http://superframe.baidu.com' >> $@
	echo ' * Build Date: '`date --iso-8601=seconds` >> $@
	echo ' * Last Commit: '`git log -1 --oneline | sed "s/\*//g"` >> $@
	echo ' */' >> $@

build-prod: build-prepare
	./node_modules/.bin/fis3 release prod -d ./build
	[ -d ./dist ] || mkdir ./dist

dist-prepare: 
	[ -d ./dist ] || mkdir ./dist

dist: build-prod dist-prepare build/banner.js
	cat build/banner.js > dist/$(NAME).js
	cat build/src/main.js >> dist/$(NAME).js
	cat build/banner.js > dist/$(NAME).min.js
	cat build/src/main.min.js >> dist/$(NAME).min.js
	cp dist/$(NAME).js dist/$(NAME)-$(VERSION).js
	cp dist/$(NAME).min.js dist/$(NAME)-$(VERSION).min.js

clean:
	rm -rf ./build/

dist-clean: clean
	rm -rf ./dist/

# Test Related

test: build-dev
	$(TEST) start --reporters mocha

test-reports: build-dev
	$(TEST) start --reporters mocha,html,coverage

test-reports-ci: build-dev
	$(TEST) start --reporters mocha,html,coverage,coveralls

# Doc Related

doc: doc-api
	sed -i 's/\\|/\&#124;/g' docs/api/*.md
	gitbook build docs

doc-deploy: doc
	cd docs/_book; \
	git init; \
	git add *; \
	git commit -m 'doc publish'; \
	git push -u git@github.com:searchfe/superframe.git master:gh-pages --force

doc-api:
	rm -rf ./docs/api && mkdir ./docs/api
	$(DOC) src/lang/promise.js > docs/api/promise.md
	$(DOC) src/lang/underscore.js > docs/api/underscore.md
	$(DOC) src/utils/http.js > docs/api/http.md
	$(DOC) src/utils/cache.js > docs/api/cache.md
	$(DOC) src/utils/cache-namespace.js > docs/api/cache-namespace.md
	$(DOC) src/utils/emitter.js > docs/api/emitter.md
	$(DOC) src/resource.js > docs/api/resource.md
	$(DOC) src/action.js > docs/api/action.md
	$(DOC) src/router/router.js > docs/api/router.md
	$(DOC) src/utils/url.js > docs/api/url.md
	$(DOC) src/service.js > docs/api/service.md
	$(DOC) src/view.js > docs/api/view.md
