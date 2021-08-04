#!/bin/bash

# Given parameters
test -z "$1" && echo "No host name given as first argument" && exit 1
URL=$1

# Variables
APPPORT=3000
FBKPORT=3001

sed -i -e "s!\$URL!$URL!" /etc/nginx/sites-available/$URL
sed -i -e "s!\$APPPORT!$APPPORT!" /etc/nginx/sites-available/$URL
sed -i -e "s!\$FBKPORT!$FBKPORT!" /etc/nginx/sites-available/$URL
ln -sfn /etc/nginx/sites-available/$URL /etc/nginx/sites-enabled/$URL
systemctl restart nginx