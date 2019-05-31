#!/bin/bash

minikube addons enable metrics-server
eval $(minikube docker-env)

docker build -t postgres-local ../db
kubectl create -f ../deployment/postgres.yaml
