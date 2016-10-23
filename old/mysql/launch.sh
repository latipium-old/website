#!/bin/bash

initfile=$(mktemp)

cat <<EOF > $initfile
FLUSH PRIVILEGES;
SET PASSWORD FOR 'root'@'localhost' = PASSWORD('$(cat /etc/latipium/website/mysql/root_password)');
CREATE DATABASE IF NOT EXISTS \`nuget\`;
GRANT USAGE ON \`nuget\`.* TO 'nuget'@'%_nuget_%.%_latipium';
DROP USER 'nuget'@'%_nuget_%.%_latipium';
CREATE USER 'nuget'@'%_nuget_%.%_latipium' IDENTIFIED BY '$(cat /etc/latipium/website/mysql/nuget_password)';
GRANT ALL PRIVILEGES ON \`nuget\`.* TO 'nuget'@'%_nuget_%.%_latipium';
CREATE DATABASE IF NOT EXISTS \`apis\`;
GRANT USAGE ON \`apis\`.* TO 'apis'@'%_apis_%.%_latipium';
DROP USER 'apis'@'%_apis_%.%_latipium';
CREATE USER 'apis'@'%_apis_%.%_latipium' IDENTIFIED BY '$(cat /etc/latipium/website/mysql/apis_password)';
GRANT ALL PRIVILEGES ON \`apis\`.* TO 'apis'@'%_apis_%.%_latipium';
GRANT ALL PRIVILEGES ON \`nuget\`.* TO 'apis'@'%_apis_%.%_latipium';
FLUSH PRIVILEGES;
EOF

mysqld_safe --skip-grant-tables --bind-address=127.0.0.1 &
telnet localhost 3306 < /dev/null 2>&1 | grep "Connection refused"
while [ $? -eq 0 ]; do
    telnet localhost 3306 < /dev/null 2>&1 | grep "Connection refused"
done
mysql -h localhost < $initfile
cat /etc/latipium/website/mysql/root_password | mysqladmin -u root -p shutdown
mysqld_safe
