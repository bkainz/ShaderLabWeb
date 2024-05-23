#!/bin/bash

# Given parameters
test -z "$1" && echo "No host name given as first argument" && exit 1
URL=$1

test -z "$2" && echo "No email for Let's Encrypt given as second argument" && exit 1
EMAIL=$2

# Variables
APPUSR=shaderLabWeb
GITDIR=/srv/git/$URL
APPDIR=/srv/http/$URL

TEMPSCRIPT="$(mktemp /tmp/init.XXXXXXXXX.sh)" || exit 1

cat << EOF >> $TEMPSCRIPT
# Create linux group and user
groupadd deployment
useradd -m -G deployment $APPUSR
cd \$(sudo -i -u $APPUSR echo \\\$HOME)

NVMPATH=\$(sudo -i -u $APPUSR command -v nvm)
if [ -z "\${NVMPATH}" ]
then
    sudo -i -u $APPUSR wget https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh
    sudo -i -u $APPUSR bash install.sh
    sudo -i -u $APPUSR rm install.sh
fi

YARNPATH=\$(sudo -i -u $APPUSR which yarn)
if [ -z "\${YARNPATH}" ]
then
  sudo -i -u $APPUSR npm install --global yarn
fi

# Create git repo
if [ -d "$GITDIR" ]
then
  rm -rf $GITDIR
fi
mkdir -p $GITDIR
chown $APPUSR:deployment $GITDIR

GITPATH=\$(which git)
ksu $APPUSR -e \$GITPATH init --bare --shared $GITDIR
git config -f $GITDIR/config receive.denynonfastforwards false

# Create app dir
if [ -d "$APPDIR" ]
then
  rm -rf $APPDIR
fi
mkdir -p $APPDIR
chown $APPUSR:$APPUSR $APPDIR

# Create web root
mkdir -p /var/www/html/$URL
chown $APPUSR:deployment /var/www/html/$URL
chmod g+w /var/www/html/$URL

# Create SSL certificate
# echo "server { server_name $URL; listen 80; }" > /etc/nginx/sites-available/$URL
# certbot certonly --nginx -n --agree-tos -d $URL -m $EMAIL

# Open ports
ufw allow http
ufw allow https
EOF

# echo $TEMPSCRIPT
# cat $TEMPSCRIPT

ksu -a $TEMPSCRIPT

rm $TEMPSCRIPT