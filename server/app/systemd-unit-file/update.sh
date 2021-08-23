#!/bin/bash

# Given parameters
test -z "$1" && echo "No host name given as first argument" && exit 1
URL=$1

# Variables
APPUSR=shaderLabWeb
APPDIR=/srv/http/$URL
SCRIPT="$(which yarn) serve"
PORT=$(test -n "$2" && echo $2 || 3000)

sed -i -e "s!\$URL!$URL!" /etc/systemd/system/$URL.service
sed -i -e "s!\$USR!$APPUSR!" /etc/systemd/system/$URL.service
sed -i -e "s!\$DIR!$APPDIR!" /etc/systemd/system/$URL.service
sed -i -e "s!\$PORT!$PORT!" /etc/systemd/system/$URL.service
sed -i -e "s!\$SCRIPT!$SCRIPT!" /etc/systemd/system/$URL.service
systemctl reenable $URL
systemctl restart $URL