FROM registry.gitlab.com/latipium/website:http-base

MAINTAINER Zach Deibert<zachdeibert@gmail.com>

RUN [ "cross-build-start" ]

COPY conf/configuration.conf /etc/latipium/website/configurations/http.conf
COPY conf/links.conf /etc/latipium/website/links/http.conf
COPY conf/services.conf /etc/latipium/website/services/http.conf
COPY conf/latipium.com /etc/nginx/sites-available/latipium.com
COPY conf/apis.latipium.com /etc/nginx/sites-available/apis.latipium.com
RUN ln -s ../sites-available/latipium.com /etc/nginx/sites-enabled/latipium.com
RUN ln -s ../sites-available/apis.latipium.com /etc/nginx/sites-enabled/apis.latipium.com
COPY content/_site /srv/
COPY content/electron/Latipium_Setup.exe /srv/electron/Latipium_Setup.exe

RUN [ "cross-build-end" ]

