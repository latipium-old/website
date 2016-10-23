REGISTRY = registry.gitlab.com
NAMESPACE = latipium
REPOSITORY = website
IMAGE = http
BASE_REGISTRY = registry.gitlab.com
BASE_NAMESPACE = latipium
BASE_REPOSITORY = website
BASE_IMAGE = http-base

include ../base.mk

.cache/deps: Dockerfile conf/configuration.conf conf/links.conf conf/services.conf conf/latipium.com conf/apis.latipium.com $(shell find content/_site -type f)
