const createApp = require('./app');
const { port } = require('./config/env');

const app = createApp();

app.listen(port, () => {
  console.log(`ATK GIAT Backend running on http://localhost:${port}`);
});
