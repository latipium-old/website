FROM resin/armv7hf-debian-qemu

MAINTAINER Zach Deibert<zachdeibert@gmail.com>
EXPOSE 80

RUN [ "cross-build-start" ]

RUN apt-get update && apt-get install -y nginx openssl wget && rm -rf /var/lib/apt/lists/*

RUN [ "cross-build-end" ]
