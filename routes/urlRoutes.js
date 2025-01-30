const express = require('express');
const router = express.Router();
const urlController = require('../controllers/urlControllers');
const analyticsController = require('../controllers/analyticsController');
const bulkShortenController = require('../controllers/bulkShortenController');
const qrCodeController = require('../controllers/qrCodeController');

router.post('/shorten', urlController.shortenUrl);
router.get('/:shortId', urlController.redirectUrl);
router.get('/analytics/:shortId', analyticsController.getAnalytics);
router.post('/bulk-shorten', bulkShortenController.bulkShorten);

module.exports = router;
