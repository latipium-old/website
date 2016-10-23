#!/bin/bash
set -e

# Only build on the master branch
if [ "$TRAVIS_PULL_REQUEST" != "false" ] || [ "$TRAVIS_BRANCH" != "master" ]; then
	echo "Skipping deploy."
	exit 0
fi

# Clone the deploy repo
COMMIT_AUTHOR_NAME="$(git show -s --format="%aN" master)"
COMMIT_AUTHOR_EMAIL="$(git show -s --format="%aE" master)"
COMMIT_MESSAGE="$(git show -s --format="%s" master)"
if [ ! -d target ]; then
	git clone https://github.com/latipium/latipium.github.io.git target
	cd target
	git remote add origin-ssh git@github.com:latipium/latipium.github.io.git
else
	cd target
	git pull origin master
fi
git config user.name "$COMMIT_AUTHOR_NAME"
git config user.email "$COMMIT_AUTHOR_EMAIL"
cd ..

# Delete old files
rm -rf target/*

# Copy built files
cp -r $(ls -A _site | sed -e "s|^|_site/|") target

# Commit new changes
cd target
git add --all
git commit -m "$COMMIT_MESSAGE"
cd ..

# Decrypt the deploy key
openssl aes-256-cbc -K $encrypted_cf618ab585db_key -iv $encrypted_cf618ab585db_iv -in deploy_key.enc -out deploy_key -d
chmod 600 deploy_key
eval $(ssh-agent -s)
ssh-add deploy_key

# Push to the deploy repo
cd target
git push origin-ssh master
cd ..

# Finished
echo "Deploy successful."
