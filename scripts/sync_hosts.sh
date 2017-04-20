#!/bin/bash

HostFile="Windows/system32/drivers/etc/hosts"
HostTemplate="./hosts.txt"

if [ ! -f "$HostTemplate" ]
then
	echo "$HostTemplate not found";
	exit 1;
fi

function SyncHosts {
	if [[ -f "//$1/c$/$HostFile" ]] ; then
		cp $HostTemplate //$1/c$/$HostFile;
		echo $1 synced;
	else
		echo $1 error;
		exit 1;
	fi
}

SyncHosts adr-sel01
SyncHosts adr-sel02
SyncHosts adr-sel03
SyncHosts adr-sel04
SyncHosts adr-sel05
SyncHosts adr-sel06
SyncHosts adr-sel07
SyncHosts adr-sel08
SyncHosts adr-sel09
SyncHosts adr-sel10
