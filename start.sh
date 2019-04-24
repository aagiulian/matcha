#!/bin/bash

#gen keys
rm -f server/.env
rm -f client/.env
yes y | ssh-keygen -t rsa -b 2048 -m PEM -f ./server/assets/keys/jwtRS256.key -N "" -q
openssl rsa -in ./server/assets/keys/jwtRS256.key -pubout -outform PEM -out ./server/assets/keys/jwtRS256.key.pub
echo -n "JWT_PRIVATE=\"" >> ./server/.env
cat ./server/assets/keys/jwtRS256.key | sed 's/$/\\n/' | tr -d '\n' | sed 's/\\n$/\"/' >> ./server/.env
echo -n "JWT_PUBLIC=\"" >> ./server/.env
cat ./server/assets/keys/jwtRS256.key.pub | sed 's/$/\\n/' | tr -d '\n' | sed 's/\\n$/\"/' >> ./server/.env
echo "HOST=\"$(minikube ip)\"" >> ./server/.env
echo "REACT_APP_HOST=\"$(minikube ip)\"" >> ./client/.env

#minikube setup

#minikube start
#eval $(minikube docker-env)

#kubectl create secret generic jwt-keys \
#	--from-file=JWT_PRIVATE=./server/assets/keys/jwtRS256.key
#	--from-file=JWT_PUBLIC=./server/assets/keys/jwtRS256.key.pub

#docker builds
docker build -t graphql-api server
docker build -t react-app-matcha client
docker build -t postgres-local db

#k8s deployment
kubectl create -f deployment

#echo "minikube running on:" $(minikube ip)

