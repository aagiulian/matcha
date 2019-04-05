#!/bin/bash

kubectl delete deployment --all
kubectl delete svc graphql-api
kubectl delete svc user-db
