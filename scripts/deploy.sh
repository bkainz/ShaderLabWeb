#!/bin/bash 

USR_SRV=(${1//@/ })
USR=${USR_SRV[0]}
SRV=${USR_SRV[1]}

NAME=ShaderLabWeb
URL=ShaderLabWeb
DIR=/var/www/html/$NAME

SSH=$USR@$SRV
BASE=$(dirname $0)/..

rsync -avL --del --groupmap=*:developers --chmod=Du=rwx,Dg=rwx,Do=rx,Fu=rw,Fg=rw,Fo=r $BASE/public/ $SSH:$DIR

scp $BASE/scripts/nginx/server-block $SSH:/etc/nginx/sites-available/$NAME
ssh $SSH "
  sudo sed -i -e 's!\$URL!$URL!' /etc/nginx/sites-available/$NAME
  sudo sed -i -e 's!\$DIR!$DIR!' /etc/nginx/sites-available/$NAME
  sudo ln -sfn /etc/nginx/sites-available/$NAME /etc/nginx/sites-enabled/$NAME
  sudo systemctl restart nginx"