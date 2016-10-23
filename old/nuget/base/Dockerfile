FROM registry.gitlab.com/latipium/website:base

MAINTAINER Zach Deibert<zachdeibert@gmail.com>
EXPOSE 9000

RUN [ "cross-build-start" ]

RUN apt-get update && apt-get install -y git php5-fpm php5-mysql && rm -rf /var/lib/apt/lists/*

RUN [ "cross-build-end" ]
