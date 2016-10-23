#!/bin/bash
set -e

# Update the PATH
PATH=$PATH:node_modules/.bin/:$(bundle show jekyll)/exe/

# Transpile typescripts
tsc --sourceMap || true
tsc -p electron --sourceMap || true

# Build Jekyll content
jekyll build
