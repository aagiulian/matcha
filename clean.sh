#!/bin/bash

eval $(minikube docker-env)

kill $(ps aux | grep serveo | awk '{print $2}')

kubectl delete deployment --all
kubectl delete svc --all
kubectl delete pvc --all
kubectl delete pv --all
docker image rm --force graphql-api
docker image rm --force react-app-matcha
