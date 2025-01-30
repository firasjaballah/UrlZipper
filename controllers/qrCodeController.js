/**
 * @swagger
 * /generate-qr:
 *   post:
 *     summary: Generate a QR code for a given URL.
 *     tags: [QR Code]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               shortUrl:
 *                 type: string
 *                 description: The shortened URL for which the QR code will be generated.
 *                 example: http://localhost:8080/my-short-url
 *     responses:
 *       200:
 *         description: The QR code image as a data URL.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 qrCode:
 *                   type: string
 *                   description: The generated QR code as a data URL.
 *                   example: "data:image/png;base64,..."
 *       500:
 *         description: Server error.
 */
exports.generateQRCode = async (shortUrl) => {
    try {
      const qrCode = await QRCode.toDataURL(shortUrl); // Generate QR code
      return qrCode;  // Return QR code as a string
    } catch (err) {
      console.error('Error generating QR code:', err);
      throw err;  // Throw the error so it can be caught in the calling function
    }
  };
  