FROM registry.gitlab.com/latipium/website:base

MAINTAINER Zach Deibert<zachdeibert@gmail.com>
CMD ["nginx", "-g", "daemon off;"]
EXPOSE 443

RUN [ "cross-build-start" ]

RUN apt-get update && apt-get install -y nginx nginx-extras ca-certificates ssl-cert && rm -rf /var/lib/apt/lists/*

RUN [ "cross-build-end" ]

