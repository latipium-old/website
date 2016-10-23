FROM registry.gitlab.com/latipium/website:base

MAINTAINER Zach Deibert<zachdeibert@gmail.com>
CMD mysql.sh
EXPOSE 3306

RUN [ "cross-build-start" ]

RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y mysql-server && rm -rf /var/lib/apt/lists/*

RUN [ "cross-build-end" ]
