#!/bin/bash

# Atualiza o código do frontend
cd /var/www/quickdeliver
git pull origin main
npm install
npm run build

# Atualiza o código do backend
cd /var/www/quickdeliver-api/quickdeliver-backend
git pull origin main
npm install
pm2 restart quickdeliver-backend

# Reinicia o Nginx
systemctl restart nginx

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