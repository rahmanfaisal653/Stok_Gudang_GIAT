module.exports = {
  apps: [
    {
      name: 'atk-giat-backend',
      script: './backend/src/server.js',
      cwd: './',
      watch: false,
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'atk-giat-frontend',
      script: 'npm',
      args: 'run preview --workspace frontend',
      cwd: './',
      watch: false,
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
