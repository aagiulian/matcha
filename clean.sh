#!/bin/bash

kubectl delete deployment --all
kubectl delete svc --all
kubectl delete pvc --all
kubectl delete pv --all
docker image rm graphql-api
