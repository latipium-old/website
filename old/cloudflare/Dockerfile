FROM registry.gitlab.com/latipium/website:cloudflare-base

MAINTAINER Zach Deibert<zachdeibert@gmail.com>

RUN [ "cross-build-start" ]

COPY configuration.conf /etc/latipium/website/configurations/cloudflare.conf
COPY launch.sh /usr/local/bin/cloudflare.sh

RUN [ "cross-build-end" ]
