#!/bin/bash

rm -f server/.env
ssh-keygen -y -t rsa -b 2048 -m PEM -f ./server/assets/keys/jwtRS256.key
openssl rsa -in ./assets/keys/jwtRS256.key -pubout -outform PEM -out ./assets/keys/jwtRS256.key.pub
echo -n "JWT_PRIVATE=\"" >> ./server/.env
cat ./assets/keys/jwtRS256.key | sed 's/$/\\n/' | tr -d '\n' | sed 's/\\n$/\"/' >> ./server/.env
echo -n "JWT_PUBLIC=\"" >> ./server/.env
cat ./assets/keys/jwtRS256.key.pub | sed 's/$/\\n/' | tr -d '\n' | sed 's/\\n$/\"/' >> ./server/.env
echo "HOST=\"$(minikube ip)\"" >> ./server/.env

