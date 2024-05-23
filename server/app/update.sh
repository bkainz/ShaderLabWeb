#!/bin/bash

# Given parameters
test -z "$1" && echo "No host name given as first argument" && exit 1
URL=$1

# Variables
APPUSR=shaderLabWeb
GITDIR=/srv/git/$URL
APPDIR=/srv/http/$URL
SCRIPT="$(sudo -i -u $APPUSR which yarn) serve"

APPUSRHOME=$(sudo -i -u $APPUSR echo \$HOME)

cat << 'EOF' >> $APPUSRHOME/nvm.sh
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm
EOF

chown $APPUSR:deployment $APPUSRHOME/nvm.sh

# Update from git repo
sudo -i -u $APPUSR git --work-tree=$APPDIR --git-dir=$GITDIR checkout -f
cd $APPDIR
sudo -i -u $APPUSR -- bash -c "cd $APPDIR; yarn install"