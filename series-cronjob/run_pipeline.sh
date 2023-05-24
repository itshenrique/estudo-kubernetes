#!/bin/bash
PROJECT_NAME='series-cronjob'

SERVER_ADDRESS='192.168.0.50:5000'

# DOCKER
echo "Docker - Criando e pushando imagem"
docker build . -t ${PROJECT_NAME}
docker tag ${PROJECT_NAME}:latest ${SERVER_ADDRESS}/${PROJECT_NAME}
docker push ${SERVER_ADDRESS}/${PROJECT_NAME}:latest

# KUBERNETES
echo "Kubernetes - Deployando projeto"
kubectl apply -f cronjob.yaml
