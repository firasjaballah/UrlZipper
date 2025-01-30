/**
 * @swagger
 * /bulk-shorten:
 *   post:
 *     summary: Bulk shorten multiple URLs at once.
 *     tags: [URL Shortener]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               urls:
 *                 type: array
 *                 items:
 *                   type: string
 *                   description: A list of URLs to be shortened.
 *                   example: ["http://example.com", "http://google.com"]
 *     responses:
 *       200:
 *         description: A list of shortened URLs.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 shortUrls:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       longUrl:
 *                         type: string
 *                         example: "http://example.com"
 *                       shortUrl:
 *                         type: string
 *                         example: "http://localhost:8080/abc123"
 *       400:
 *         description: Invalid input. Expected an array of URLs.
 *       500:
 *         description: Internal server error.
 */
exports.bulkShorten = async (req, res) => {
    try {
        const { urls } = req.body;
        if (!Array.isArray(urls) || urls.length === 0) {
            return res.status(400).json({ error: 'Invalid input' });
        }

        const shortUrls = await Promise.all(
            urls.map(async (longUrl) => {
                const shortId = shortid.generate();
                const newUrl = new Url({ longUrl, shortId });
                await newUrl.save();
                return { longUrl, shortUrl: `${process.env.BASE_URL}/${shortId}` };
            })
        );

        res.json({ shortUrls });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};
