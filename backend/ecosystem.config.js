// Configuration PM2 pour le déploiement
module.exports = {
  apps: [
    {
      name: 'james-studio-api',
      script: 'server.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development',
        PORT: 9091
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 9091
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    }
  ]
};

