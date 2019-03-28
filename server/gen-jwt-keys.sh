#!/bin/bash

ssh-keygen -t rsa -b 2048 -m PEM -f ./assets/keys/jwtRS256.key
openssl rsa -in ./assets/keys/jwtRS256.key -pubout -outform PEM -out ./assets/keys/jwtRS256.key.pub
