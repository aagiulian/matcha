#!/bin/bash

rm -f .env
ssh-keygen -t rsa -b 2048 -m PEM -f ./assets/keys/jwtRS256.key
openssl rsa -in ./assets/keys/jwtRS256.key -pubout -outform PEM -out ./assets/keys/jwtRS256.key.pub
echo -n "JWT_PRIVATE=\"" >> .env
cat ./assets/keys/jwtRS256.key | sed 's/$/\\n/' | tr -d '\n' | sed 's/\\n$/\"/' >> .env
echo -n "JWT_PUBLIC=\"" >> .env
cat ./assets/keys/jwtRS256.key.pub | sed 's/$/\\n/' | tr -d '\n' | sed 's/\\n$/\"/' >> .env

