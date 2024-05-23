#!/bin/bash

USR_SRV=(${1//@/ })
USR=${USR_SRV[0]}
SRV=${USR_SRV[1]}
PORT=$(test -n "$2" && echo $2 || echo 3000)

DIR="$(cd "$(dirname "$BASH_SOURCE")" &> /dev/null && pwd)"
URL=$SRV
GITDIR=/srv/git/$URL

ssh $USR@$SRV "ksu -a -c \"usermod -a -G deployment $USR\""

git push --force ssh://$USR@$SRV:$GITDIR HEAD:master
APP_UPDATE_SCRIPT="$(basename `git rev-parse --show-toplevel`)-$(git rev-parse HEAD)-app-update.sh"
rsync -v --info=progress2 $DIR/app/update.sh $USR@$SRV:/tmp/$APP_UPDATE_SCRIPT

SYSTEMD_UPDATE_SCRIPT="$(basename `git rev-parse --show-toplevel`)-$(git rev-parse HEAD)-systemd-update.sh"
rsync -v --info=progress2 $DIR/app/systemd-unit-file/update.sh $USR@$SRV:/tmp/$SYSTEMD_UPDATE_SCRIPT

SERVER_UPDATE_SCRIPT="$(basename `git rev-parse --show-toplevel`)-$(git rev-parse HEAD)-nginx-update.sh"
rsync -v --info=progress2 $DIR/app/nginx-server-block/update.sh $USR@$SRV:/tmp/$SERVER_UPDATE_SCRIPT

rsync -v --info=progress2 $DIR/app/systemd-unit-file/unit-file $USR@$SRV:/tmp/$URL.service.tmp
rsync -v --info=progress2 $DIR/app/nginx-server-block/server-block $USR@$SRV:/tmp/$URL.sites-available.tmp

ssh $USR@$SRV "cd /tmp/ && chmod ug+rwx $APP_UPDATE_SCRIPT && ksu -a -c \"./$APP_UPDATE_SCRIPT \"$URL\"\""

ssh $USR@$SRV "ksu -a -c \"mv /tmp/$URL.service.tmp /etc/systemd/system/$URL.service\""
ssh $USR@$SRV "cd /tmp/ && chmod ug+rwx $SYSTEMD_UPDATE_SCRIPT && ksu -a -c \"./$SYSTEMD_UPDATE_SCRIPT \"$URL\" \"$PORT\"\""

ssh $USR@$SRV "ksu -a -c \"mv /tmp/$URL.sites-available.tmp /etc/nginx/sites-available/$URL\""
ssh $USR@$SRV "cd /tmp/ && chmod ug+rwx $SERVER_UPDATE_SCRIPT && ksu -a -c \"./$SERVER_UPDATE_SCRIPT \"$URL\" \"$PORT\"\""
