FROM registry.gitlab.com/latipium/website:base

MAINTAINER Zach Deibert<zachdeibert@gmail.com>
CMD cloudflare.sh

RUN [ "cross-build-start" ]

RUN apt-get update && apt-get install -y jq && rm -rf /var/lib/apt/lists/*

RUN [ "cross-build-end" ]
