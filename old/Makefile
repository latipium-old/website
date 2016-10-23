.PHONY: all
all: base apis-base cloudflare-base config-base http-base mysql-base nuget-base apis cloudflare config http mysql nuget

.PHONY: login
login:
	@echo docker login -u gitlab-ci-token -p \$$CI_BUILD_TOKEN registry.gitlab.com
	@docker login -u gitlab-ci-token -p ${CI_BUILD_TOKEN} registry.gitlab.com

apis-base: login
	$(MAKE) -C apis/base build
	$(MAKE) -C . login
	$(MAKE) -C apis/base push

apis: login
	$(MAKE) -C apis build
	$(MAKE) -C . login
	$(MAKE) -C apis push

.PHONY: base
base: login
	$(MAKE) -C base build
	$(MAKE) -C . login
	$(MAKE) -C base push

.PHONY: cloudflare-base
cloudflare-base: login
	$(MAKE) -C cloudflare/base build
	$(MAKE) -C . login
	$(MAKE) -C cloudflare/base push

.PHONY: cloudflare
cloudflare: login
	$(MAKE) -C cloudflare build
	$(MAKE) -C . login
	$(MAKE) -C cloudflare push

.PHONY: config-base
config-base: login
	$(MAKE) -C config/base build
	$(MAKE) -C . login
	$(MAKE) -C config/base push

.PHONY: config
config: login
	$(MAKE) -C config build
	$(MAKE) -C . login
	$(MAKE) -C config push

.PHONY: http-base
http-base: login
	$(MAKE) -C http/base build
	$(MAKE) -C . login
	$(MAKE) -C http/base push

.PHONY: http
http: login
	$(MAKE) -C http build
	$(MAKE) -C . login
	$(MAKE) -C http push

.PHONY: mysql-base
mysql-base: login
	$(MAKE) -C mysql/base build
	$(MAKE) -C . login
	$(MAKE) -C mysql/base push

.PHONY: mysql
mysql: login
	$(MAKE) -C mysql build
	$(MAKE) -C . login
	$(MAKE) -C mysql push

.PHONY: nuget-base
nuget-base: login
	$(MAKE) -C nuget/base build
	$(MAKE) -C . login
	$(MAKE) -C nuget/base push

.PHONY: nuget
nuget: login
	$(MAKE) -C nuget build
	$(MAKE) -C . login
	$(MAKE) -C nuget push

.PHONY: build-typescript
build-typescript:
	tsc -p http/content --sourceMap || true
	tsc -p http/content/electron --sourceMap || true

.PHONY: build-nothing
build-nothing:
	echo hi

.PHONY: build-libnunit-core-interfaces-mock
build-libnunit-core-interfaces-mock:
	$(MAKE) -C apis/base libnunit-core-interfaces2.6.3-cil.deb

.PHONY: build-jekyll
build-jekyll:
	rm -f http/content/_site/node_modules/electron-prebuilt || rm -Rf http/content/_site/node_modules/electron-prebuilt || true
	cd http/content && jekyll build

.PHONY: build-apis
build-apis:
	cd apis && nuget restore -SolutionDirectory ../.. packages.config && xbuild Com.Latipium.Website.Apis.csproj /p:Configuration=Release

.PHONY: build-nsis
build-nsis:
	makensis http/content/electron/Latipium.nsi

.PHONY: build-docker-base
build-docker-base: base

.PHONY: build-docker-apis-base
build-docker-apis-base: apis-base

.PHONY: build-docker-cloudflare-base
build-docker-cloudflare-base: cloudflare-base

.PHONY: build-docker-config-base
build-docker-config-base: config-base

.PHONY: build-docker-http-base
build-docker-http-base: http-base

.PHONY: build-docker-mysql-base
build-docker-mysql-base: mysql-base

.PHONY: build-docker-nuget-base
build-docker-nuget-base: nuget-base

.PHONY: build-docker-apis
build-docker-apis: apis

.PHONY: build-docker-cloudflare
build-docker-cloudflare: cloudflare

.PHONY: build-docker-config
build-docker-config: config

.PHONY: build-docker-http
build-docker-http: http

.PHONY: build-docker-mysql
build-docker-mysql: mysql

.PHONY: build-docker-nuget
build-docker-nuget: nuget

.PHONY: build-deploy
build-deploy:
	sed -i -e "s|{{ content ip }}|$$(cat /etc/hosts | grep -E "content-server$$" | sed -e "s|\t.*||")|" docker-compose.yml
	sudo -u carbon ~carbon/launch.sh
	git checkout -- docker-compose.yml

.PHONY: stage-transpile
stage-transpile:

.PHONY: stage-mockGeneration
stage-mockGeneration:

.PHONY: stage-build
stage-build:

.PHONY: stage-dockerRoot
stage-dockerRoot:

.PHONY: stage-dockerBase
stage-dockerBase:

.PHONY: stage-dockerImage
stage-dockerImage:

.PHONY: stage-deploy
stage-deploy:

.PHONY: stage-undeploy
stage-undeploy:

.PHONY: dev-typescript
stage-transpile: dev-typescript
dev-typescript:
	docker run --rm -v $(shell pwd):/code zachdeibert/typescript:latest make -C /code build-typescript

.PHONY: dev-nothing
stage-transpile: dev-nothing
dev-nothing:
	docker run --rm -v $(shell pwd):/code zachdeibert/debian-dev:latest make -C /code build-nothing

.PHONY: dev-libnunit-core-interfaces-mock
stage-mockGeneration: dev-libnunit-core-interfaces-mock
dev-libnunit-core-interfaces-mock:
	docker run --rm -v $(shell pwd):/code zachdeibert/debian-dev:latest make -C /code build-libnunit-core-interfaces-mock

.PHONY: dev-jekyll
stage-build: dev-jekyll
dev-jekyll:
	docker run --rm -v $(shell pwd):/code zachdeibert/jekyll:3.1.6 make -C /code build-jekyll

.PHONY: dev-apis
stage-build: dev-apis
dev-apis:
	docker run --rm -v $(shell pwd)/..:/code zachdeibert/mono-make:4.2.3.4 make -C /code/$(shell basename $(shell pwd)) build-apis

.PHONY: dev-nsis
stage-build: dev-nsis
dev-nsis:
	docker run --rm --entrypoint make -v $(shell pwd)/..:/code zachdeibert/nsis:latest -C /code/$(shell basename $(shell pwd)) build-nsis

.PHONY: dev-docker-base
stage-dockerRoot: dev-docker-base
dev-docker-base: base/.dev/Dockerfile base/.dev/Makefile base/.dev/launch.sh base/.dev/links.conf base/.dev/services.conf
	$(MAKE) -C base/.dev dev

base/.dev/Dockerfile: base/Dockerfile base/dev-Dockerfile.patch
	mkdir -p base/.dev/
	patch base/Dockerfile base/dev-Dockerfile.patch -o base/.dev/Dockerfile

base/.dev/%: base/%
	mkdir -p base/.dev/
	cp $< $@

.PHONY: dev-docker-apis-base
stage-dockerRoot: dev-docker-apis-base
dev-docker-apis-base:
	$(MAKE) -C apis/base dev

.PHONY: dev-docker-cloudflare-base
stage-dockerRoot: dev-docker-cloudflare-base
dev-docker-cloudflare-base:
	$(MAKE) -C cloudflare/base dev

.PHONY: dev-docker-config-base
stage-dockerRoot: dev-docker-config-base
dev-docker-config-base:
	$(MAKE) -C config/base dev

.PHONY: dev-docker-http-base
stage-dockerRoot: dev-docker-http-base
dev-docker-http-base:
	$(MAKE) -C http/base dev

.PHONY: dev-docker-mysql-base
stage-dockerRoot: dev-docker-mysql-base
dev-docker-mysql-base:
	$(MAKE) -C mysql/base dev

.PHONY: dev-docker-nuget-base
stage-dockerRoot: dev-docker-nuget-base
dev-docker-nuget-base:
	$(MAKE) -C nuget/base dev

.PHONY: dev-docker-apis
stage-dockerImage: dev-docker-apis
dev-docker-apis:
	$(MAKE) -C apis dev

.PHONY: dev-docker-cloudflare
stage-dockerImage: dev-docker-cloudflare
dev-docker-cloudflare:
	$(MAKE) -C cloudflare dev

.PHONY: dev-docker-config
stage-dockerImage: dev-docker-config
dev-docker-config:
	$(MAKE) -C config dev

.PHONY: dev-docker-http
stage-dockerImage: dev-docker-http
dev-docker-http:
	$(MAKE) -C http dev

.PHONY: dev-docker-mysql
stage-dockerImage: dev-docker-mysql
dev-docker-mysql:
	$(MAKE) -C mysql dev

.PHONY: dev-docker-nuget
stage-dockerImage: dev-docker-nuget
dev-docker-nuget:
	$(MAKE) -C nuget dev

.PHONY: dev-deploy
stage-deploy: dev-deploy
dev-deploy: .dev/docker-compose.yml dev-content-server/launcher/Latipium-win32-x64.zip dev-content-server/launcher/Latipium-win32-ia32.zip dev-content-server/launcher/Latipium-darwin-x64.zip dev-content-server/launcher/Latipium-mas-x64.zip dev-content-server/launcher/Latipium-linux-x64.tar.gz dev-content-server/launcher/Latipium-linux-ia32.tar.gz
	cd .dev && docker-compose up

.PHONY: dev-undeploy
stage-undeploy: dev-undeploy
dev-undeploy: .dev/docker-compose.yml
	cd .dev && docker-compose down

dev-content-server/launcher/%: launcher/%
	mkdir -p dev-content-server/launcher
	rm -f $@
	ln $< $@ || cp $< $@

.dev/docker-compose.yml: docker-compose.yml dev-docker-compose.yml.patch
	mkdir -p .dev
	patch docker-compose.yml dev-docker-compose.yml.patch -o .dev/docker-compose.yml

.PHONY: .stage-transpile
.stage-transpile:
	$(MAKE) -C . stage-transpile

.PHONY: .stage-mockGeneration
.stage-mockGeneration: .stage-transpile
	$(MAKE) -C . stage-mockGeneration

.PHONY: .stage-build
.stage-build: .stage-mockGeneration
	$(MAKE) -C . stage-build

.PHONY: .stage-dockerRoot
.stage-dockerRoot: .stage-build
	$(MAKE) -C . stage-dockerRoot

.PHONY: .stage-dockerBase
.stage-dockerBase: .stage-dockerRoot
	$(MAKE) -C . stage-dockerBase

.PHONY: .stage-dockerImage
.stage-dockerImage: .stage-dockerBase
	$(MAKE) -C . stage-dockerImage

.PHONY: .stage-deploy
.stage-deploy: .stage-dockerImage
	$(MAKE) -C . stage-deploy

.PHONY: .stage-undeploy
.stage-undeploy:
	$(MAKE) -C . stage-undeploy

.PHONY: dev
dev:
	$(MAKE) -C . .stage-undeploy
	$(MAKE) -C . .stage-deploy

.PHONY: dev-down
dev-down: .stage-undeploy
