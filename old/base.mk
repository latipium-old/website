.PHONY: all
all: build push

.PHONY: build
build: .cache/deps .cache/current .cache/latest
	test -f .cache/needsPushed || cmp -s .cache/current .cache/latest || $(MAKE) -C . force-build

.PHONY: dev
dev: .cache/deps
	docker build $(DOCKER_FLAGS) -t $(REGISTRY)/$(NAMESPACE)/$(REPOSITORY):$(IMAGE) .

rebuild:

.PHONY: force-build
force-build: rebuild .cache/deps .cache/latest
	docker build $(DOCKER_FLAGS) -t $(REGISTRY)/$(NAMESPACE)/$(REPOSITORY):$(IMAGE) .
	mv .cache/latest .cache/current
	touch .cache/needsPushed

.cache/builddeps:
	$(MAKE) -C . .cache/latest
	$(MAKE) -C . .cache/deps

.cache/deps:
	docker build $(DOCKER_FLAGS) -t $(REGISTRY)/$(NAMESPACE)/$(REPOSITORY):$(IMAGE) .
	test -f .cache/latest && mv .cache/latest .cache/current || true
	touch .cache/needsPushed .cache/deps

.PHONY: push
push:
	test -f .cache/needsPushed && docker push $(REGISTRY)/$(NAMESPACE)/$(REPOSITORY):$(IMAGE) || test ! -f .cache/needsPushed
	rm -f .cache/needsPushed

.cache/current: rebuild
	test -f $@ || docker pull $(REGISTRY)/$(NAMESPACE)/$(REPOSITORY):$(IMAGE) || echo -1 > $@
	test -f $@ || docker images | grep -E "^$(REGISTRY)/$(NAMESPACE)/$(REPOSITORY) +$(BASE_IMAGE)" | sed -e "s|  *|\t|g" | cut -f 3 > $@

.cache/latest: rebuild
	docker pull $(BASE_REGISTRY)/$(BASE_NAMESPACE)/$(BASE_REPOSITORY):$(BASE_IMAGE)
	docker images | grep -E "^$(BASE_REGISTRY)/$(BASE_NAMESPACE)/$(BASE_REPOSITORY) +$(BASE_IMAGE)" | sed -e "s|  *|\t|g" | cut -f 3 > $@
