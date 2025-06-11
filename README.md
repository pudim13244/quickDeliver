# QuickDeliver

## Sobre o Projeto

QuickDeliver é uma plataforma de pedidos online desenvolvida com React, Vite, TypeScript, shadcn-ui e Tailwind CSS.

## Tecnologias Utilizadas
- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Como rodar o projeto localmente?

Pré-requisitos: Node.js 18+ e npm

```sh
# Clone o repositório
git clone <YOUR_GIT_URL>

# Acesse o diretório do projeto
cd <YOUR_PROJECT_NAME>

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

## Deploy

### Pré-requisitos
- Node.js 18+
- npm
- Acesso SSH à VPS
- Acesso ao painel da Hostinger

### Configuração do Servidor

1. Conecte-se à VPS via SSH:
```bash
ssh root@82.25.69.111
```

2. Crie os diretórios necessários:
```bash
mkdir -p /var/www/quickdeliver
mkdir -p /var/www/quickdeliver-api
```

3. Instale o Nginx:
```bash
apt update
apt install nginx
```

4. Configure o Nginx:
```bash
# Copie o arquivo nginx.conf para /etc/nginx/sites-available/quickdeliver
cp nginx.conf /etc/nginx/sites-available/quickdeliver

# Crie um link simbólico
ln -s /etc/nginx/sites-available/quickdeliver /etc/nginx/sites-enabled/

# Teste a configuração
nginx -t

# Reinicie o Nginx
systemctl restart nginx
```

5. Instale o PM2 globalmente:
```bash
npm install -g pm2
```

### Deploy

1. Execute o script de deploy:
```bash
chmod +x deploy.sh
./deploy.sh
```

2. Verifique se o backend está rodando:
```bash
pm2 status
```

3. Verifique os logs se necessário:
```bash
pm2 logs quickdeliver-api
```

### URLs
- Frontend: http://quickdeliver.vmagenciadigital.com
- API: http://apiquick.vmagenciadigital.com

### Banco de Dados
- Host: localhost
- Usuário: u328800108_food
- Banco: u328800108_food_fly

### Troubleshooting

1. Se o frontend não estiver acessível:
```bash
# Verifique os logs do Nginx
tail -f /var/log/nginx/error.log
```

2. Se a API não estiver respondendo:
```bash
# Verifique o status do PM2
pm2 status

# Verifique os logs da aplicação
pm2 logs quickdeliver-api
```

3. Se precisar reiniciar o backend:
```bash
pm2 restart quickdeliver-api
```
