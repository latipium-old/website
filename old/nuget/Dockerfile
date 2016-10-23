FROM registry.gitlab.com/latipium/website:nuget-base

MAINTAINER Zach Deibert<zachdeibert@gmail.com>
CMD ["nuget.sh"]

RUN [ "cross-build-start" ]

COPY configuration.conf /etc/latipium/website/configurations/nuget.conf
COPY services.conf /etc/latipium/website/services/nuget.conf
COPY launch.sh /usr/local/bin/nuget.sh
COPY config.php.patch /var/local/config.php.patch
WORKDIR /var/local
RUN git clone https://github.com/zachdeibert/simple-nuget-server.git
RUN patch simple-nuget-server/inc/config.php config.php.patch -o simple-nuget-server/inc/config.php.in
RUN sed -e "s|/var/run/php5-fpm.sock|9000|g" -e "s|;*security.limit_extensions = |security.limit_extensions = .xml |g" -i /etc/php5/fpm/pool.d/www.conf
RUN sed -e "s|;daemonize = yes|daemonize=no|g" -i /etc/php5/fpm/php-fpm.conf

RUN [ "cross-build-end" ]
