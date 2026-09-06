require('dotenv').config();

const http = require('http');
const connectDB = require('./src/config/db');
const app = require('./src/app');
const { initSocket } = require('./src/lib/socket');

connectDB();

const server = http.createServer(app);
initSocket(server);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});