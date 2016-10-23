#!/bin/bash

# Wait for other containers to start
for conf in $(find /etc/latipium/website/links/ -type f); do
    cat "$conf" | while read host; do
        if [ "a$host" != "a" ]; then
            echo "Waiting for host $host to start"
            ping -c 1 "$host"
            while [ $? -ne 0 ]; do
                ping -c 1 "$host"
            done
        fi
    done
done

# Wait for other containers to get required services running
for conf in $(find /etc/latipium/website/services/ -type f); do
    cat "$conf" | while read service; do
        if [ "a$service" != "a" ]; then
            echo "Waiting for service $service to start"
            telnet $service < /dev/null 2>&1 | grep "Connection refused"
            while [ $? -eq 0 ]; do
                telnet $service < /dev/null 2>&1 | grep "Connection refused"
            done
        fi
    done
done

# Pull configuration files from config image
for conf in $(find /etc/latipium/website/configurations/ -type f); do
    cat "$conf" | while read file; do
        if [ "a$file" != "a" ]; then
            echo "Downloading $file..."
            mkdir -p "$(dirname "$file")"
            curl -o "$file" "http://config/$(echo "$file" | sed -e "s|^/||")" || (echo "Unable to download $file!" && exit 1)
        fi
    done
done

# Run the startup script
script=
while (( "$#" )); do
    script="$script\"$1\" "
    shift
done
eval $script
exit $?
