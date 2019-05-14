#!/bin/bash

#replace any username with actual username in deployment.yaml file
sed -i.bak "s/vfour/$(whoami)/g" deployment/deployment.yaml
sed -i.bak "s/vico/$(whoami)/g" deployment/deployment.yaml
sed -i.bak "s/agiulian/$(whoami)/g" deployment/deployment.yaml
sed -i.bak "s/Workstation/$(whoami)/g" deployment/deployment.yaml
rm deployment/*.bak

MATCHA_API="matcha-api-$(whoami)"
MATCHA_FRONT="matcha-front-$(whoami)"
MATCHA_EMAIL_CHECK="matcha-email-check-$(whoami)"

#gen keys
rm -f server/.env
rm -f client/.env
yes y | ssh-keygen -t rsa -b 2048 -m PEM -f ./server/assets/keys/jwtRS256.key -N "" -q
openssl rsa -in ./server/assets/keys/jwtRS256.key -pubout -outform PEM -out ./server/assets/keys/jwtRS256.key.pub
echo -n "JWT_PRIVATE=\"" >> ./server/.env
cat ./server/assets/keys/jwtRS256.key | sed 's/$/\\n/' | tr -d '\n' | sed 's/\\n$/\"/' >> ./server/.env
echo -n "JWT_PUBLIC=\"" >> ./server/.env
cat ./server/assets/keys/jwtRS256.key.pub | sed 's/$/\\n/' | tr -d '\n' | sed 's/\\n$/\"/' >> ./server/.env

echo "API_HOST=$MATCHA_API.serveo.net" >> ./server/.env
echo "EMAIL_CHECK=$MATCHA_EMAIL_CHECK.serveo.net" >> ./server/.env
echo "REACT_APP_HOST=$MATCHA_FRONT.serveo.net" >> ./server/.env

echo "REACT_APP_API_HOST=$MATCHA_API.serveo.net" >> ./client/.env
echo "REACT_APP_EMAIL_CHECK=$MATCHA_EMAIL_CHECK.serveo.net" >> ./client/.env
echo "REACT_APP_HOST=$MATCHA_FRONT.serveo.net" >> ./client/.env

ssh -o PubkeyAuthentication=no -R $MATCHA_API:80:$(minikube ip):30077 serveo.net 1>> ./logs/graphql.out 2>> ./logs/graphql.err &

ssh -o PubkeyAuthentication=no -R $MATCHA_EMAIL_CHECK:80:$(minikube ip):30078 serveo.net 1>> ./logs/email_check.out 2>> ./logs/email_check.err &
ssh -o PubkeyAuthentication=no -R $MATCHA_FRONT:80:$(minikube ip):30080 serveo.net 1>> ./logs/react.out 2>> ./logs/react.err &

#minikube setup

#minikube start
#eval $(minikube docker-env)

#kubectl create secret generic jwt-keys \
#	--from-file=JWT_PRIVATE=./server/assets/keys/jwtRS256.key
#	--from-file=JWT_PUBLIC=./server/assets/keys/jwtRS256.key.pub

#docker builds
docker build -t graphql-api server
docker build -t react-app-matcha client
docker build -t postgres-local db

#k8s deployment
kubectl create -f deployment

#echo "minikube running on:" $(minikube ip)

