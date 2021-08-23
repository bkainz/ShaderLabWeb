#!/bin/bash

# Given parameters
test -z "$1" && echo "No host name given as first argument" && exit 1
URL=$1

# Variables
APPPORT=$(test -n "$2" && echo $2 || 3000)
FBKPORT=$(($APPPORT + 1))

# Disable default server
rm -f /etc/nginx/sites-enabled/default

# Set up server
sed -i -e "s!\$URL!$URL!" /etc/nginx/sites-available/$URL
sed -i -e "s!\$APPPORT!$APPPORT!" /etc/nginx/sites-available/$URL
sed -i -e "s!\$FBKPORT!$FBKPORT!" /etc/nginx/sites-available/$URL
ln -sfn /etc/nginx/sites-available/$URL /etc/nginx/sites-enabled/$URL

# Reload config
systemctl restart nginx