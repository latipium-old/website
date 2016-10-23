REGISTRY = registry.gitlab.com
NAMESPACE = latipium
REPOSITORY = website
IMAGE = apis
BASE_REGISTRY = registry.gitlab.com
BASE_NAMESPACE = latipium
BASE_REPOSITORY = website
BASE_IMAGE = apis-base

include ../base.mk

.cache/deps: Dockerfile $(shell find -name "*.cs" -and -type f) App.config launch.sh configuration.conf links.conf services.conf
