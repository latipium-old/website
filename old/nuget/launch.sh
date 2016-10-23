#!/bin/bash

sed -e "s|{{ *password *}}|$(cat /etc/latipium/website/mysql/nuget_password)|g" \
    /var/local/simple-nuget-server/inc/config.php.in > /var/local/simple-nuget-server/inc/config.php
php5-fpm --fpm-config /etc/php5/fpm/php-fpm.conf
