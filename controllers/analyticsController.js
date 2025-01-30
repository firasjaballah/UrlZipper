/**
 * @swagger
 * /analytics/{shortId}:
 *   get:
 *     summary: Get analytics (clicks and referrers) for a shortened URL.
 *     tags: [URL Shortener]
 *     parameters:
 *       - in: path
 *         name: shortId
 *         required: true
 *         description: The shortened URL ID.
 *         schema:
 *           type: string
 *           example: abc123
 *     responses:
 *       200:
 *         description: The analytics data for the shortened URL.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 clicks:
 *                   type: integer
 *                   example: 100
 *                 referrers:
 *                   type: object
 *                   additionalProperties:
 *                     type: integer
 *                   example: 
 *                     "http://google.com": 50
 *                     "http://facebook.com": 30
 *       404:
 *         description: URL not found.
 *       500:
 *         description: Internal server error.
 */
exports.getAnalytics = async (req, res) => {
    console.log(req.params)
    try {
        const { shortId } = req.params;
        const url = await Url.findOne({ shortId });

        if (!url) {
            return res.status(404).json({ error: 'URL not found' });
        }

        res.json({
            clicks: url.clicks,
            referrers: Object.fromEntries(url.referrers)
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};
