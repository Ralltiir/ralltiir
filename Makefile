# @author: yangjun14(yangjun14@baidu.com)
# Use npm scripts instead

export PATH := $(shell npm bin):$(PATH)
export PORT = 9877
export TEST = karma --port $(PORT)
export DOC = jsdoc2md
.PHONY: test doc test-reports

test:
	$(TEST) start --reporters mocha

test-watch:
	$(TEST) start --reporters mocha --auto-watch --no-single-run

test-reports:
	$(TEST) start --reporters mocha,html,coverage

test-reports-ci:
	$(TEST) start --reporters mocha,html,coverage,coveralls

doc: doc-api
	sed -i '' 's/\\|/\&#124;/g' docs/api/*.md
	gitbook build docs

doc-deploy: doc
	cd docs/_book; \
	git init; \
	git add *; \
	git commit -m 'doc publish'; \
	git push -u git@github.com:Ralltiir/ralltiir.git master:gh-pages --force

doc-api:
	rm -rf ./docs/api && mkdir ./docs/api
	$(DOC) src/utils/http.js > docs/api/http.md
	$(DOC) src/utils/cache.js > docs/api/cache.md
	$(DOC) src/utils/cache-namespace.js > docs/api/cache-namespace.md
	$(DOC) src/utils/emitter.js > docs/api/emitter.md
	$(DOC) src/resource.js > docs/api/resource.md
	$(DOC) src/action.js > docs/api/action.md
	$(DOC) src/router/router.js > docs/api/router.md
	$(DOC) src/utils/url.js > docs/api/url.md
	$(DOC) src/services.js > docs/api/service.md
	# $(DOC) src/view.js > docs/api/view.md
