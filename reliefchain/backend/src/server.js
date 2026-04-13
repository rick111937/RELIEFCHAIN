const app = require('./app');
const connectDB = require('./config/db');
const redisClient = require('./config/redis');

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();
  // Bypass Redis connection for local development if Docker is unavailable
  // await redisClient.connect().catch(console.error);
  app.listen(PORT, () => console.log(`ReliefChain API running on port ${PORT}`));
}
start();
