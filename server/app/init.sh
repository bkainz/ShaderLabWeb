#!/bin/bash

# Given parameters
test -z "$1" && echo "No host name given as first argument" && exit 1
URL=$1

test -z "$2" && echo "No email for Let's Encrypt given as second argument" && exit 1
EMAIL=$2

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
nvm install 18.7.0

# Variables
APPUSR=shaderLabWeb
GITDIR=/srv/git/$URL
APPDIR=/srv/http/$URL

# Create linux group and user
groupadd deployment
useradd -m -G deployment $APPUSR

# Create git repo
mkdir -p $GITDIR
chown $APPUSR:deployment $GITDIR
sudo -u $APPUSR git init --bare --shared $GITDIR
git config -f $GITDIR/config receive.denynonfastforwards false

# Create app dir
mkdir -p $APPDIR
chown $APPUSR:$APPUSR $APPDIR

# Create web root
mkdir -p /var/www/html/$URL
chown $APPUSR:deployment /var/www/html/$URL
chmod g+w /var/www/html/$URL

# Create SSL certificate
echo "server { server_name $URL; listen 80; }" > /etc/nginx/sites-available/$URL
certbot certonly --nginx -n --agree-tos -d $URL -m $EMAIL

# Open ports
ufw allow http
ufw allow https