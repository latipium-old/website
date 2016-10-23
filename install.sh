#!/bin/bash

# Install javascript dependencies
npm Install

# Install ruby dependencies
gpg --keyserver hkp://keys.gnupg.net --recv-keys 409B6B1796C275462A1703113804BB82D39DC0E3
curl -sSL http://get.rvm.io | bash -s stable --ruby
source ~/.rvm/scripts/rvm
rvm install 2.3.0
bundle install
