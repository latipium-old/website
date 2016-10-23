#!/bin/bash
set -e

# Only build on the master branch
if [ "$TRAVIS_PULL_REQUEST" != "false" ] || [ "$TRAVIS_BRANCH" != "master" ]; then
	echo "Skipping deploy."
	exit 0
fi

# Clone the deploy repo
if [ ! -d target ]; then
	git clone https://github.com/latipium/latipium.github.io.git target
fi
cd latipium.github.io
git checkout master
git pull origin master
git remote add origin-ssh git@github.com:latipium/latipium.github.io.git
git config user.name "$(git show -s --format="%aN" master)"
git config user.email "$(git show -s --format="%aE" master)"
cd ..

# Delete old files
rm -rf target/*

# Copy built files
cp -r _site/* target

# Check for changes
if [ -z $(git diff --exit-code) ]; then
	echo "No changes were made to the site content."
	exit 0
fi

# Decrypt the deploy key
openssl aes-256-cbc -K $encrypted_cf618ab585db_key -iv $encrypted_cf618ab585db_iv -in deploy_key.enc -out deploy_key -d
chmod 600 deploy_key
eval $(ssh-agent -s)
ssh-add deploy_key

# Push to the deploy repo
cd latipium.github.io
git push origin-ssh master
cd ..

# Finished
echo "Deploy successful."
