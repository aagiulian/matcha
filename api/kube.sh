#!/bin/bash

docker build -t node-web-app .
kubectl delete deployment --all
kubectl delete service stupid-server
kubectl create -f ~/truc/matcha/api/k8s/all.yaml

kubectl get all | grep "pod/stupid-server"


