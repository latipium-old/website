#!/bin/bash
set -e

# Transpile typescripts
tsc --sourceMap || true
tsc -p electron --sourceMap || true

# Build Jekyll content
jekyll build
