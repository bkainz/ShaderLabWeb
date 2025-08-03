#!/bin/bash

USR_SRV=(${1//@/ })
USR=${USR_SRV[0]}
SRV=${USR_SRV[1]}

EMAIL=$2

DIR="$(cd "$(dirname "$BASH_SOURCE")" &> /dev/null && pwd)"
URL=$SRV
INITSCRIPT="$(basename `git rev-parse --show-toplevel`)-$(git rev-parse HEAD)-init.sh"

cat $DIR/app/init.sh | ssh $USR@$SRV -T "cat > /tmp/$INITSCRIPT"
cat $DIR/app/ssl-params-self-signed.conf | ssh $USR@$SRV -T "cat > /tmp/ssl-params-self-signed.conf"
ssh $USR@$SRV "cd /tmp/ && bash $INITSCRIPT $URL $EMAIL $USR && rm $INITSCRIPT"
"$DIR/update.sh" "$1" "$3"
