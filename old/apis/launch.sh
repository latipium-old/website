#!/bin/bash

sed -e "s|{{ *password *}}|$(cat /etc/latipium/website/mysql/apis_password)|g" /usr/local/bin/Com.Latipium.Website.Apis.exe.config.in > /usr/local/bin/Com.Latipium.Website.Apis.exe.config
cd /srv
mono /usr/local/bin/Com.Latipium.Website.Apis.exe
