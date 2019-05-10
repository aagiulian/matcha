#!/bin/bash

eval $(minikube docker-env)

kill $(ps aux | grep serveo | awk '{print $2}')

kubectl delete deployment --all
kubectl delete svc --all
kubectl delete pvc --all
kubectl delete pv --all
docker image rm graphql-api
docker image rm react-app-matcha
