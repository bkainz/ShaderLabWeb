#!/bin/bash

USR_SRV=(${1//@/ })
USR=${USR_SRV[0]}
SRV=${USR_SRV[1]}
PORT=$(test -n "$2" && echo $2 || 3000)

DIR="$(cd "$(dirname "$BASH_SOURCE")" &> /dev/null && pwd)"
URL=$SRV
GITDIR=/srv/git/$URL

ssh $USR@$SRV "sudo usermod -a -G deployment $USR"

git push --force ssh://$USR@$SRV:$GITDIR HEAD:master
ssh $USR@$SRV 'sudo bash -s' < "$DIR/app/update.sh" "$URL"

rsync --rsync-path="sudo rsync" "$DIR/app/systemd-unit-file/unit-file" $USR@$SRV:/etc/systemd/system/$URL.service
ssh $USR@$SRV 'sudo bash -s' < "$DIR/app/systemd-unit-file/update.sh" "$URL" "$PORT"

rsync --rsync-path="sudo rsync" "$DIR/app/nginx-server-block/server-block" $USR@$SRV:/etc/nginx/sites-available/$URL
ssh $USR@$SRV 'sudo bash -s' < "$DIR/app/nginx-server-block/update.sh" "$URL" "$PORT"