FROM registry.gitlab.com/latipium/website:mysql-base

MAINTAINER Zach Deibert<zachdeibert@gmail.com>

RUN [ "cross-build-start" ]

COPY configuration.conf /etc/latipium/website/configurations/mysql.conf
COPY launch.sh /usr/local/bin/mysql.sh
RUN sed -e "s|bind-address[ \t]*=.*|bind-address = 0.0.0.0|" -i /etc/mysql/my.cnf

RUN [ "cross-build-end" ]
