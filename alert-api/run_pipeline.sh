#!/bin/bash
# Esse script server como pipeline com os seguintes steps
# 1 - Cria a imagem local
# 2 - Cria uma tag para ela
# 3 - Da um push na imagem para o remote
# 4 - Deleta o deploy existente do

PROJECT_NAME='alert-api'

SERVER_ADDRESS='192.168.0.50:5000'

APPLICATION_PORT=3002

# DOCKER
echo "Docker - Criando e pushando imagem"
docker build . -t ${PROJECT_NAME}
docker tag ${PROJECT_NAME}:latest ${SERVER_ADDRESS}/${PROJECT_NAME}
docker push ${SERVER_ADDRESS}/${PROJECT_NAME}:latest

# KUBERNETES
echo "Kubernetes - Deployando projeto"
kubectl delete deploy ${PROJECT_NAME}
kubectl delete svc ${PROJECT_NAME}
kubectl apply -f k8s/deployment.yaml
kubectl expose deployment ${PROJECT_NAME} --type=LoadBalancer --port=${APPLICATION_PORT} --target-port=${APPLICATION_PORT}
