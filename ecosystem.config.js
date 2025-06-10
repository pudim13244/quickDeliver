module.exports = {
  apps : [{
    name: 'quickdeliver-backend',
    script: 'index.js',
    cwd: '/var/www/quickdeliver-api/quickdeliver-backend',
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