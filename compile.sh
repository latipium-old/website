#!/bin/bash --login
set -e

# Update the PATH
rvm use 2.3.0
PATH=$PATH:node_modules/.bin/:$(bundle show jekyll)/exe/

# Transpile typescripts
tsc --sourceMap || true
tsc -p electron --sourceMap || true

# Build Jekyll content
jekyll build
