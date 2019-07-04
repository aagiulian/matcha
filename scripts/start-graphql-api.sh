#!/bin/bash

minikube addons enable metrics-server
eval $(minikube docker-env)

sed -i.bak "s/vfour/$(whoami)/g" ../deployment/graphql-api.yaml
sed -i.bak "s/vico/$(whoami)/g" ../deployment/graphql-api.yaml
sed -i.bak "s/agiulian/$(whoami)/g" ../deployment/graphql-api.yaml
sed -i.bak "s/Workstation/$(whoami)/g" ../deployment/graphql-api.yaml
rm ../deployment/*.bak

MATCHA_API="matcha-api-$(whoami)"
MATCHA_FRONT="matcha-front-$(whoami)"
MATCHA_EMAIL_CHECK="matcha-email-check-$(whoami)"

rm -f ../server/.env

yes y | ssh-keygen -t rsa -b 2048 -m PEM -f ../server/assets/keys/jwtRS256.key -N "" -q
openssl rsa -in ../server/assets/keys/jwtRS256.key -pubout -outform PEM -out ../server/assets/keys/jwtRS256.key.pub
echo -n "JWT_PRIVATE=\"" >> ../server/.env
cat ../server/assets/keys/jwtRS256.key | sed 's/$/\\n/' | tr -d '\n' | sed 's/\\n$/\"/' >> ../server/.env
echo -n "JWT_PUBLIC=\"" >> ../server/.env
cat ../server/assets/keys/jwtRS256.key.pub | sed 's/$/\\n/' | tr -d '\n' | sed 's/\\n$/\"/' >> ../server/.env

cat ../server/secrets >> ../server/.env
echo "API_HOST=$MATCHA_API.serveo.net" >> ../server/.env
echo "EMAIL_CHECK=$MATCHA_EMAIL_CHECK.serveo.net" >> ../server/.env
echo "REACT_APP_HOST=$MATCHA_FRONT.serveo.net" >> ../server/.env

docker build -t graphql-api ../server

kubectl create -f ../deployment/graphql-api.yaml

ssh -o PubkeyAuthentication=no -R $MATCHA_API:80:$(minikube ip):30077 serveo.net 1> ../logs/graphql.out 2> ../logs/graphql.err &
ssh -o PubkeyAuthentication=no -R $MATCHA_EMAIL_CHECK:80:$(minikube ip):30078 serveo.net 1> ../logs/email_check.out 2> ../logs/email_check.err &
