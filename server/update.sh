#!/bin/bash

USR_SRV=(${1//@/ })
USR=${USR_SRV[0]}
SRV=${USR_SRV[1]}
PORT=$(test -n "$2" && echo $2 || echo 3000)

DIR="$(cd "$(dirname "$BASH_SOURCE")" &> /dev/null && pwd)"
URL=$SRV
GITDIR=/srv/git/$URL

SUDO_TEST=$(ssh $USR@$SRV "sudo -l")
if [[ $SUDO_TEST =~ "(ALL : ALL)" ]]
then
    COMMAND_PREFIX="sudo -- "
    echo "HAS SUDO PRIVILEGES! USING SUDO..."
    COMMAND_SUFFIX=""
else
    COMMAND_PREFIX="ksu -a -c \""
    echo "NO SUDO PRIVILEGES! USING KSU..."
    COMMAND_SUFFIX="\""
fi

git push --force ssh://$USR@$SRV:$GITDIR HEAD:master
APP_UPDATE_SCRIPT="$(basename `git rev-parse --show-toplevel`)-$(git rev-parse HEAD)-app-update.sh"
rsync -v --info=progress2 $DIR/app/update.sh $USR@$SRV:/tmp/$APP_UPDATE_SCRIPT

SYSTEMD_UPDATE_SCRIPT="$(basename `git rev-parse --show-toplevel`)-$(git rev-parse HEAD)-systemd-update.sh"
rsync -v --info=progress2 $DIR/app/systemd-unit-file/update.sh $USR@$SRV:/tmp/$SYSTEMD_UPDATE_SCRIPT

SERVER_UPDATE_SCRIPT="$(basename `git rev-parse --show-toplevel`)-$(git rev-parse HEAD)-nginx-update.sh"
rsync -v --info=progress2 $DIR/app/nginx-server-block/update.sh $USR@$SRV:/tmp/$SERVER_UPDATE_SCRIPT

rsync -v --info=progress2 $DIR/app/systemd-unit-file/unit-file $USR@$SRV:/tmp/$URL.service.tmp
rsync -v --info=progress2 $DIR/app/nginx-server-block/server-block $USR@$SRV:/tmp/$URL.sites-available.tmp


TEMPSCRIPT="$(mktemp /tmp/init.XXXXXXXXX.sh)" || exit 1

cat << EOF >> $TEMPSCRIPT
cd /tmp/
chmod ug+rwx $APP_UPDATE_SCRIPT
chmod ug+rwx $SYSTEMD_UPDATE_SCRIPT
chmod ug+rwx $SERVER_UPDATE_SCRIPT

sudo ./$APP_UPDATE_SCRIPT $URL
sudo mv /tmp/$URL.service.tmp /etc/systemd/system/$URL.service
sudo ./$SYSTEMD_UPDATE_SCRIPT $URL $PORT
sudo mv /tmp/$URL.sites-available.tmp /etc/nginx/sites-available/$URL
sudo ./$SERVER_UPDATE_SCRIPT $URL $PORT
EOF

rsync -v --info=progress2 $TEMPSCRIPT $USR@$SRV:/tmp/configure-remaining-scripts.sh

ssh $USR@$SRV "$COMMAND_PREFIX bash /tmp/configure-remaining-scripts.sh$COMMAND_SUFFIX && rm /tmp/configure-remaining-scripts.sh"
