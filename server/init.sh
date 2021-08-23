#!/bin/bash

USR_SRV=(${1//@/ })
USR=${USR_SRV[0]}
SRV=${USR_SRV[1]}

EMAIL=$2

DIR="$(cd "$(dirname "$BASH_SOURCE")" &> /dev/null && pwd)"
URL=$SRV

ssh $USR@$SRV 'sudo bash -s' < "$DIR/app/init.sh" "$URL" "$EMAIL"
"$DIR/update.sh" "$1" "$3"