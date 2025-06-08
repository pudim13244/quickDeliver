# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/2dfa281b-2726-49e9-b133-5581d09b0076

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/2dfa281b-2726-49e9-b133-5581d09b0076) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/2dfa281b-2726-49e9-b133-5581d09b0076) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

# QuickDeliver - Instruções de Deploy

## Pré-requisitos
- Node.js 18+
- npm
- SSH access à VPS
- Acesso ao painel da Hostinger

## Configuração do Servidor

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

## Deploy

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

## URLs
- Frontend: http://quickdeliver.vmagenciadigital.com
- API: http://apiquick.vmagenciadigital.com

## Banco de Dados
- Host: localhost
- Usuário: u328800108_food
- Banco: u328800108_food_fly

## Troubleshooting

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
