#!/bin/bash --login
set -e

dev=0
if [ "a$1" == "adev" ]; then
    dev=1
fi

function prefixOutput() {
    while read line; do
        echo "$1$line"
    done
}

# Update the PATH
rvm use 2.3.0
PATH=$PATH:node_modules/.bin/:$(bundle show jekyll)/exe/

# Transpile typescripts
function tsProj() {
    if [ $dev -eq 1 ]; then
        tsc -p "$1" --sourceMap -w | prefixOutput "$2" &
    else
        tsc -p "$1" --sourceMap || true
    fi
}
tsProj . "[Main TypeScript]     "
tsProj electron "[Electron TypeScript] "

# Download dependencies
curl -o js/infinite-jekyll.js https://raw.githubusercontent.com/tobiasahlin/infinite-jekyll/master/js/infinite-jekyll.js

# Build Jekyll content
if [ $dev -eq 1 ]; then
    jekyll serve -H 0.0.0.0 | prefixOutput "[Jekyll]              " &
else
    jekyll build
fi

# Run the development server in the background
if [ $dev -eq 1 ]; then
    echo "Press any key to shut down the development server."
    read -sN1
    kill $(jobs -p)
fi
