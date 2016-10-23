FROM resin/armv7hf-debian-qemu

MAINTAINER Zach Deibert<zachdeibert@gmail.com>

ENTRYPOINT ["launch.sh"]

RUN [ "cross-build-start" ]

RUN apt-get update && apt-get install -y curl iputils-ping telnet && rm -rf /var/lib/apt/lists/*
RUN mkdir -p /etc/latipium/website/configurations /etc/latipium/website/links /etc/latipium/website/services
COPY launch.sh /usr/local/bin/launch.sh
COPY links.conf /etc/latipium/website/links/base.conf
COPY services.conf /etc/latipium/website/services/base.conf

RUN [ "cross-build-end" ]
