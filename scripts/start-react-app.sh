#!/bin/bash

minikube addons enable metrics-server
eval $(minikube docker-env)

#replace any username with actual username in deployment.yaml file
sed -i.bak "s/vfour/$(whoami)/g" ../deployment/react-app.yaml
sed -i.bak "s/vico/$(whoami)/g" ../deployment/react-app.yaml
sed -i.bak "s/agiulian/$(whoami)/g" ../deployment/react-app.yaml
sed -i.bak "s/Workstation/$(whoami)/g" ../deployment/react-app.yaml
rm ../deployment/*.bak

MATCHA_API="matcha-api-$(whoami)"
MATCHA_FRONT="matcha-front-$(whoami)"
MATCHA_EMAIL_CHECK="matcha-email-check-$(whoami)"

#gen keys
rm -f ../client/.env

cat ../client/secrets >> ../client/.env
echo "REACT_APP_API_HOST=$MATCHA_API.serveo.net" >> ../client/.env
echo "REACT_APP_EMAIL_CHECK=$MATCHA_EMAIL_CHECK.serveo.net" >> ../client/.env
echo "REACT_APP_HOST=$MATCHA_FRONT.serveo.net" >> ../client/.env

#docker builds
docker build -t react-app-matcha ../client

#k8s deployment
kubectl create -f ../deployment/react-app.yaml

ssh -tt -o PubkeyAuthentication=no -R $MATCHA_FRONT:80:$(minikube ip):30080 serveo.net 1> ../logs/react.out 2> ../logs/react.err &
