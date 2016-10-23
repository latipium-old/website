#!/bin/bash
set -e

# Install javascript dependencies
npm install

# Install ruby dependencies
rvm install 2.3.0
rvm use 2.3.0
rvm rubygems latest
ruby --version
bundle install
