module.exports = {
  apps : [{
    name: 'pedindo-aqui-agora-backend',
    script: 'server.js',
    cwd: '/var/www/quickdeliver-api/pedindo-aqui-agora-backend',
    instances: 'max',
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }]
}; 