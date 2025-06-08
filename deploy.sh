#!/bin/bash

# Deploy do Frontend
echo "Fazendo deploy do frontend..."
cd ..
npm run build
scp -r dist/* root@82.25.69.111:/var/www/quickdeliver/

# Deploy do Backend
echo "Fazendo deploy do backend..."
cd pedindo-aqui-agora-backend
scp -r ./* root@82.25.69.111:/var/www/quickdeliver-api/
scp .env root@82.25.69.111:/var/www/quickdeliver-api/

# Configuração do servidor
echo "Configurando o servidor..."
ssh root@82.25.69.111 << 'ENDSSH'
cd /var/www/quickdeliver-api
npm install --production
pm2 restart ecosystem.config.js
ENDSSH

echo "Deploy concluído!" 