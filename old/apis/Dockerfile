FROM registry.gitlab.com/latipium/website:apis-base

MAINTAINER Zach Deibert<zachdeibert@gmail.com>

RUN [ "cross-build-start" ]

COPY configuration.conf /etc/latipium/website/configurations/apis.conf
COPY links.conf /etc/latipium/website/links/apis.conf
COPY services.conf /etc/latipium/website/services/apis.conf
COPY launch.sh /usr/local/bin/Com.Latipium.Website.Apis.sh
COPY bin/Release/Com.Latipium.Website.Apis.exe /usr/local/bin/Com.Latipium.Website.Apis.exe
COPY bin/Release/Com.Latipium.Website.Apis.exe.config /usr/local/bin/Com.Latipium.Website.Apis.exe.config.in
COPY bin/Release/* /usr/local/bin/
RUN chmod +x /usr/local/bin/Com.Latipium.Website.Apis.sh /usr/local/bin/Com.Latipium.Website.Apis.exe

RUN [ "cross-build-end" ]
