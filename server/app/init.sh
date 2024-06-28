#!/bin/bash

# Given parameters
test -z "$1" && echo "No host name given as first argument" && exit 1
URL=$1

test -z "$2" && echo "No email for Let's Encrypt given as second argument" && exit 1
EMAIL=$2

test -z "$3" && echo "No user specified for SSH, git and other ssh-based commands will fail"
SSHUSR=$3

# Variables
APPUSR=shaderLabWeb
GITDIR=/srv/git/$URL
APPDIR=/srv/http/$URL

TEMPSCRIPT="$(mktemp /tmp/init.XXXXXXXXX.sh)" || exit 1

cat << EOF >> $TEMPSCRIPT
# Create linux group and user
groupadd -r --gid 99 deployment
useradd -r --uid 99 -m -G deployment $APPUSR

sudo usermod -a -G deployment $SSHUSR
cd \$(sudo -i -u $APPUSR echo \\\$HOME)

# Install nvm for managing node versions
NVMPATH=\$(sudo -i -u $APPUSR command -v nvm)
if [ -z "\${NVMPATH}" ]
then
    sudo -i -u $APPUSR wget https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh
    sudo -i -u $APPUSR bash install.sh
    sudo -i -u $APPUSR rm install.sh
fi

# Set node 18 to default
sudo -i -u $APPUSR nvm install 18
sudo -i -u $APPUSR nvm alias default 18

# Install yarn globally
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
chown -R $APPUSR:deployment $GITDIR

GITPATH=\$(which git)
# Needed to avoid warnings about dubious ownership
sudo -i -u $SSHUSR \$GITPATH config --global --add safe.directory $GITDIR
sudo -i -u $APPUSR \$GITPATH init --bare --shared $GITDIR
sudo -i -u $APPUSR \$GITPATH config -f $GITDIR/config receive.denynonfastforwards false
chown -R $APPUSR:deployment $GITDIR

# Create app dir
if [ -d "$APPDIR" ]
then
  rm -rf $APPDIR
fi
mkdir -p $APPDIR
chown -R $APPUSR:$APPUSR $APPDIR

# Create web root
mkdir -p /var/www/html/$URL
chown -R $APPUSR:deployment /var/www/html/$URL
chmod g+w /var/www/html/$URL

# Create SSL certificate
echo "server { server_name $URL; listen 80; }" > /etc/nginx/sites-available/$URL
certbot certonly --nginx -n --agree-tos -d $URL -m $EMAIL
# Create self-signed SSL certificate
# ## Following this guide: 
# ## https://web.archive.org/web/20240221174906/https://www.digitalocean.com/community/tutorials/how-to-create-a-self-signed-ssl-certificate-for-nginx-in-ubuntu-16-04
# if [ ! -f /etc/ssl/private/nginx-selfsigned.key ]
#     openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/ssl/private/nginx-selfsigned.key -out /etc/ssl/certs/nginx-selfsigned.crt
# fi
# if [ ! -f /etc/ssl/certs/dhparam.pem 2048 ]
#     openssl dhparam -out /etc/ssl/certs/dhparam.pem 2048
# fi
cp /tmp/ssl-params-self-signed.conf /etc/nginx/snippets/

# Open ports
ufw allow http
ufw allow https
EOF

# echo $TEMPSCRIPT
# cat $TEMPSCRIPT

SUDO_TEST=$(sudo -l)
if [[ $SUDO_TEST =~ "(ALL : ALL)" ]]
then
  echo "HAS SUDO PRIVILEGES! USING SUDO..."
  sudo bash $TEMPSCRIPT
else
  echo "NO SUDO PRIVILEGES! USING KSU..."
  ksu -a $TEMPSCRIPT
fi

rm $TEMPSCRIPT