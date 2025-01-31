const Url = require('../models/Url');
const shortid = require('shortid');
const validUrl = require('valid-url');
const generateQRCode = require('./qrCodeController').generateQRCode; 
const { setAsync, getAsync } = require('../utils/redisHelper');

const BASE_URL = process.env.BASE_URL || 'https://urlzipper.onrender.com';

/**
 * @swagger
 * /shorten:
 *   post:
 *     summary: Shortens a given URL with an optional custom alias and expiration time.
 *     description: This endpoint shortens a long URL and optionally generates a custom alias and expiration time.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               longUrl:
 *                 type: string
 *                 description: The URL to shorten.
 *                 example: 'http://example.com'
 *               customAlias:
 *                 type: string
 *                 description: Custom alias for the shortened URL (optional).
 *                 example: 'mycustomalias'
 *               expiresIn:
 *                 type: integer
 *                 description: The expiration time of the shortened URL in seconds (optional).
 *                 example: 3600
 *     responses:
 *       200:
 *         description: Successfully shortened URL.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 shortUrl:
 *                   type: string
 *                   description: The shortened URL.
 *                   example: 'http://localhost:8080/mycustomalias'
 *                 qrCode:
 *                   type: string
 *                   description: The generated QR code as a Data URL.
 *                   example: 'data:image/png;base64,...'
 *       400:
 *         description: Invalid URL or custom alias already taken.
 *       500:
 *         description: Internal server error.
 */
exports.shortenUrl = async (req, res) => {
    const { longUrl, customAlias, expiresIn } = req.body;

    if (!validUrl.isUri(longUrl)) {
        return res.status(400).json({ error: 'Invalid URL' });
    }

    let shortId = customAlias || shortid.generate();
    const count = await Url.countDocuments();
if (count === 0) {
    const sampleUrl = new Url({
        longUrl: 'http://example.com',
        shortId: 'sample123'
    });
    await sampleUrl.save();
}
    if (customAlias) {
        const existingAlias = await Url.findOne({ customAlias });
        if (existingAlias) {
            return res.status(400).json({ error: 'Custom alias already taken' });
        }
    }

    let expiresAt = expiresIn ? new Date(Date.now() + expiresIn * 1000) : null;
    
    try {
        let newUrl = new Url({ longUrl, shortId, customAlias, expiresAt });
        await newUrl.save();

        // Optional: Uncomment if you want to use Redis for caching
        // await setAsync(shortId, 3600, longUrl);

        const qrCode = await generateQRCode(`${BASE_URL}/${shortId}`);

        res.json({ shortUrl: `${BASE_URL}/${shortId}`, qrCode: qrCode });
    } catch (err) {
        console.log({ err });
        res.status(500).json({ error: 'Server error' });
    }
};

/**
 * @swagger
 * /{shortId}:
 *   get:
 *     summary: Redirects to the original long URL for the provided short ID.
 *     description: This endpoint retrieves the original long URL for the given short URL ID, checking for expiration and caching.
 *     parameters:
 *       - in: path
 *         name: shortId
 *         required: true
 *         description: The short URL ID to redirect.
 *         schema:
 *           type: string
 *           example: 'mycustomalias'
 *     responses:
 *       301:
 *         description: Redirected to the original long URL.
 *       404:
 *         description: URL not found.
 *       410:
 *         description: URL has expired.
 *       500:
 *         description: Internal server error.
 */
exports.redirectUrl = async (req, res) => {
    const { shortId } = req.params;

    let cachedUrl = await getAsync(shortId);
    if (cachedUrl) {
        return res.redirect(cachedUrl);
    }

    try {
        const url = await Url.findOne({ shortId });
        if (!url) {
            return res.status(404).json({ error: 'URL not found' });
        }

        if (url.expiresAt && new Date() > url.expiresAt) {
            return res.status(410).json({ error: 'URL has expired' });
        }

        url.clicks += 1;
        const referrer = req.headers.referer || 'direct';
        url.referrers.set(referrer, (url.referrers.get(referrer) || 0) + 1);
        await url.save();

        // Optional: Uncomment if you want to use Redis for caching
        // await setAsync(shortId, 3600, url.longUrl);
        res.redirect(url.longUrl);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};
