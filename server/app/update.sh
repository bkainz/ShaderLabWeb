#!/bin/bash

# Given parameters
test -z "$1" && echo "No host name given as first argument" && exit 1
URL=$1

# Variables
APPUSR=shaderLabWeb
GITDIR=/srv/git/$URL
APPDIR=/srv/http/$URL
SCRIPT="$(which yarn) serve"

# Update from git repo
sudo -u $APPUSR git --work-tree=$APPDIR --git-dir=$GITDIR checkout -f
cd $APPDIR
sudo -u $APPUSR yarn install