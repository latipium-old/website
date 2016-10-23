FROM registry.gitlab.com/latipium/website:config-base

MAINTAINER Zach Deibert<zachdeibert@gmail.com>
VOLUME /var/www/html
CMD run.sh

RUN [ "cross-build-start" ]

COPY run.sh /usr/local/bin/run.sh

RUN [ "cross-build-end" ]
