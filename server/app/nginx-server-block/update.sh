#!/bin/bash

# Given parameters
test -z "$1" && echo "No host name given as first argument" && exit 1
URL=$1

# Variables
PORT=3000

sed -i -e "s!\$URL!$URL!" /etc/nginx/sites-available/$URL
sed -i -e "s!\$PORT!$PORT!" /etc/nginx/sites-available/$URL
ln -sfn /etc/nginx/sites-available/$URL /etc/nginx/sites-enabled/$URL
systemctl restart nginx