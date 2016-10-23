#!/bin/bash

function random() {
    cat /dev/urandom | fold -w 1 | grep -a "[$1]" | tr -d "\n" | head -c $2
}

mkdir -p /var/www/html/etc/ssl/certs/ /var/www/html/etc/ssl/private/ /var/www/html/etc/latipium/website/mysql /var/www/html/etc/latipium/website/auth /var/www/html/etc/latipium/website/cloudflare
if [ ! -f /var/www/html/etc/ssl/certs/ssl-cert-snakeoil.pem ] || [ ! -f /var/www/html/etc/ssl/private/ssl-cert-snakeoil.key ]; then
    openssl req -new -x509 -days 365 -nodes -out /var/www/html/etc/ssl/certs/ssl-cert-snakeoil.pem -keyout /var/www/html/etc/ssl/private/ssl-cert-snakeoil.key -batch -subj "/C=US/ST=Kansas/O=Latipium/CN=*.latipium.com/"
fi
if [ ! -f /var/www/html/etc/latipium/website/mysql/root_password ]; then
    random "A-Za-z0-9" 32 > /var/www/html/etc/latipium/website/mysql/root_password
fi
if [ ! -f /var/www/html/etc/latipium/website/mysql/apis_password ]; then
    random "A-Za-z0-9" 32 > /var/www/html/etc/latipium/website/mysql/apis_password
fi
if [ ! -f /var/www/html/etc/latipium/website/mysql/nuget_password ]; then
    random "A-Za-z0-9" 32 > /var/www/html/etc/latipium/website/mysql/nuget_password
fi
wget "http://content-server/secrets/auth" -O /var/www/html/etc/latipium/website/auth/secret
wget "http://content-server/secrets/cf-email" -O /var/www/html/etc/latipium/website/cloudflare/email
wget "http://content-server/secrets/cf-key" -O /var/www/html/etc/latipium/website/cloudflare/key

nginx -g "daemon off;"
