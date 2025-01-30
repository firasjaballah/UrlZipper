const { createClient } = require('@redis/client');

// Create Redis client
const redisClient = createClient({
  url: 'redis://localhost:6379',
});

// Ensure Redis client is connected before using it
async function connectRedis() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
}

// Event listeners
redisClient.on('connect', () => {
  console.log('✅ Redis client connected');
});

redisClient.on('error', (err) => {
  console.error('❌ Redis error:', err);
});

// Function to set a key with expiration
async function setAsync(key, expirationTime, value) {
  try {
    await connectRedis(); // Ensure Redis is connected
    await redisClient.setEx(key, expirationTime, value);
    console.log(`🔹 Key "${key}" set successfully`);
  } catch (error) {
    console.error('❌ Error with Redis set operation:', error);
  }
}

// Function to get a key
async function getAsync(key) {
  try {
    await connectRedis(); // Ensure Redis is connected
    return await redisClient.get(key);
  } catch (error) {
    console.error('❌ Error retrieving key:', error);
  }
}

module.exports = { setAsync, getAsync, redisClient };
