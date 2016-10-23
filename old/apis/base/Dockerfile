FROM registry.gitlab.com/latipium/website:base

MAINTAINER Zach Deibert<zachdeibert@gmail.com>
CMD ["Com.Latipium.Website.Apis.sh"]
EXPOSE 80
VOLUME /srv/packages
ENV MONO_CPU_ARCH armv5 thumb

RUN [ "cross-build-start" ]

COPY libnunit-core-interfaces2.6.3-cil.deb /tmp/libnunit-core-interfaces2.6.3-cil.deb
RUN dpkg -i --force-all /tmp/libnunit-core-interfaces2.6.3-cil.deb
RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 3FA7E0328081BFF6A14DA29AA6A19B38D3D831EF
COPY mono-xamarin.list /etc/apt/sources.list.d/mono-xamarin.list
RUN apt-get update && apt-get -yf install && apt-get install -y mono-devel nuget && rm -rf /var/lib/apt/lists/*

RUN [ "cross-build-end" ]
