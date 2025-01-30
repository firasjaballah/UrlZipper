/**
 * @swagger
 * /set-expiration:
 *   post:
 *     summary: Set a key in Redis with an expiration time.
 *     tags: [Redis]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               key:
 *                 type: string
 *                 description: The key to store in Redis.
 *                 example: user:123
 *               value:
 *                 type: string
 *                 description: The value associated with the key.
 *                 example: '{"name": "John Doe", "email": "john@example.com"}'
 *               expirationTime:
 *                 type: integer
 *                 description: Expiration time in seconds.
 *                 example: 3600
 *     responses:
 *       200:
 *         description: The key was successfully set with the expiration time.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Key set with expiration time successfully.
 *       400:
 *         description: Missing key, value, or expiration time.
 *       500:
 *         description: Internal server error.
 */
async function setExpiration(req, res) {
  const { key, value, expirationTime } = req.body;  // Expecting JSON body with key, value, and expiration time

  if (!key || !value || !expirationTime) {
    return res.status(400).json({ error: 'Key, value, and expiration time are required.' });
  }

  try {
    // Set the key with the given expiration time (in seconds)
    await setAsync(key, expirationTime, value);
    return res.status(200).json({ message: 'Key set with expiration time successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error setting key with expiration.' });
  }
}

/**
 * @swagger
 * /get-expiration/{key}:
 *   get:
 *     summary: Retrieve the value of a key from Redis.
 *     tags: [Redis]
 *     parameters:
 *       - name: key
 *         in: path
 *         description: The key to retrieve from Redis.
 *         required: true
 *         schema:
 *           type: string
 *           example: user:123
 *     responses:
 *       200:
 *         description: The key and its associated value.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 key:
 *                   type: string
 *                   example: user:123
 *                 value:
 *                   type: string
 *                   example: '{"name": "John Doe", "email": "john@example.com"}'
 *       400:
 *         description: Missing key parameter.
 *       404:
 *         description: Key not found.
 *       500:
 *         description: Internal server error.
 */
async function getExpiration(req, res) {
  const { key } = req.params;  // Expecting the key to be passed as a URL parameter

  if (!key) {
    return res.status(400).json({ error: 'Key is required.' });
  }

  try {
    const value = await getAsync(key);
    if (value === null) {
      return res.status(404).json({ error: 'Key not found.' });
    }
    return res.status(200).json({ key, value });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error retrieving key.' });
  }
}

module.exports = { setExpiration, getExpiration };
