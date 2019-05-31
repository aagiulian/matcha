#!/bin/bash

minikube addons enable metrics-server

kubectl create -f ../deployment/adminer.yaml
