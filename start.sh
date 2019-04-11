#!/bin/bash

#minikube setup

#minikube start
eval $(minikube docker-env)

#kubectl create secret generic jwt-keys \
#	--from-file=JWT_PRIVATE=./server/assets/keys/jwtRS256.key
#	--from-file=JWT_PUBLIC=./server/assets/keys/jwtRS256.key.pub

#docker builds
docker build -t graphql-api server
docker build -t postgres-local db

#k8s deployment
kubectl create -f deployment

echo "minikube running on:" $(minikube ip)
