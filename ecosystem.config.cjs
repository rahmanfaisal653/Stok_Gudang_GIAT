module.exports = {
  apps: [
    // ── Backend Node.js ──────────────────────────────────────
    {
      name: 'atk-giat-backend',
      script: './backend/index.js',
      cwd: './',
      watch: false,
      env: {
        NODE_ENV: 'production'
      }
    },
    // ── Frontend (Vite preview — jalankan setelah npm run build) ──
    {
      name: 'atk-giat-frontend',
      script: 'npx',
      args: 'vite preview --host 0.0.0.0 --port 3000',
      cwd: './',
      watch: false,
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
