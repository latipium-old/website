REGISTRY = registry.gitlab.com
NAMESPACE = latipium
REPOSITORY = website
IMAGE = apis-base
BASE_REGISTRY = registry.gitlab.com
BASE_NAMESPACE = latipium
BASE_REPOSITORY = website
BASE_IMAGE = base

include ../../base.mk

.cache/deps: Dockerfile mono-xamarin.list

%.deb: %/rebuild/DEBIAN/control
	dpkg-deb -b $*/rebuild
	mv $*/rebuild.deb $@

%/rebuild/DEBIAN/control: %/control.tar.gz
	mkdir -p $*/rebuild/DEBIAN
	tar -C $*/rebuild/DEBIAN -xzf $<
	rm $$(find $*/rebuild/DEBIAN -type f -not -name control)

%/control.tar.gz: %.deb.orig
	unar $<
	mv $*.deb $*

%.deb.orig:
	rm -rf $**
	apt-get download $*
	mv $** $@
