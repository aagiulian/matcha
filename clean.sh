#!/bin/bash

kubectl delete deployment --all
kubectl delete svc --all
docker image rm graphql-api
