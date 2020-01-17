#!/bin/bash

## Script for preparing smoke test
sudo ifconfig docker0 10.200.10.1/24
## Get Streamr Docker dev
git clone https://github.com/streamr-dev/streamr-docker-dev.git
## Switch out image for local one
sed -i "s#$OWNER/$IMAGE_NAME:dev#$OWNER/$IMAGE_NAME\:local#g" "$TRAVIS_BUILD_DIR"/streamr-docker-dev/docker-compose.override.yml
## Start up services needed
"$TRAVIS_BUILD_DIR"/streamr-docker-dev/streamr-docker-dev/bin.sh start 5
"$TRAVIS_BUILD_DIR"/streamr-docker-dev/streamr-docker-dev/bin.sh start ganache

## Wait for the service to come online and test
wait_time=10;
for (( i=0; i < 5; i=i+1 )); do
    curl -X POST localhost:8545 --data '{"jsonrpc":"2.0","method":"net_version","params":[],"id":1}'
    res=$?;
    if test "$res" != "0"; then
        echo "Attempting to connect to Ganache retrying in $wait_time seconds";
        sleep $wait_time;
        wait_time=$(( 2*wait_time )) ;
    else
       break;
    fi;
done;
set -e
curl -X POST localhost:8545 --data '{"jsonrpc":"2.0","method":"net_version","params":[],"id":1}'
