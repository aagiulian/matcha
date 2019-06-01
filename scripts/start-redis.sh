#!/bin/bash

minikube addons enable metrics-server
eval $(minikube docker-env)

kubectl create -f ../deployment/redis.yaml
